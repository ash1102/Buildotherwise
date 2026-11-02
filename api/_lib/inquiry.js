/**
 * submitInquiry: saves a Get Involved message and emails Start@buildotherwise.org.
 * Open to visitors who are not signed in. The record is saved even if the email fails.
 * Ported from base44/functions/submitInquiry (same fields, limits, and wording).
 *
 * Email goes out through Resend when RESEND_API_KEY is set (optional INQUIRY_FROM, INQUIRY_TO).
 * Without it the message is still saved and `emailed` is false.
 */
import { clean, oneLine, recentCount, json } from './http.js';

export const NOTIFY_TO = 'Start@buildotherwise.org';
export const MAX_PER_EMAIL_PER_HOUR = 3; // the same address can send a few messages an hour
export const MAX_EMAILS_PER_HOUR = 20; // past this, messages are still saved but no notification goes out

export const LABELS = {
  partner: 'Partner organization',
  volunteer: 'Volunteer',
  fiscal_sponsor: 'Fiscal sponsor or funder',
  participant: 'Interested in the program',
  other: 'Something else',
};

export function buildEmail({ reachingOutAs, name, email, organization, interests, message }) {
  const lines = [
    `New Get Involved message from the Build Otherwise site.`,
    ``,
    `Reaching out as: ${LABELS[reachingOutAs]}`,
    `Name: ${oneLine(name)}`,
    `Email: ${oneLine(email)}`,
    organization ? `Organization: ${oneLine(organization)}` : null,
    interests.length ? `Would like to help with: ${interests.join(', ')}` : null,
    ``,
    message,
  ].filter((line) => line !== null);
  return {
    subject: `Get Involved: ${LABELS[reachingOutAs]}, ${oneLine(name).slice(0, 80)}`,
    text: lines.join('\n'),
  };
}

/**
 * @param {{ payload: object, db: object|null, env: object, fetchImpl: Function }} deps
 * `db` is a Supabase client that may insert and read inquiries (the service client). When it is
 * null the message cannot be saved, and the caller is told so.
 */
export async function handleSubmitInquiry({ payload, db, env, fetchImpl }) {
  try {
    // Hidden field that people never see. Bots fill it in.
    if (clean(payload?.website, 200)) return json({ ok: true, emailed: false });

    const reachingOutAs = clean(payload?.reaching_out_as, 40);
    const name = clean(payload?.name, 200);
    const email = clean(payload?.email, 320);
    const organization = clean(payload?.organization, 300);
    const message = clean(payload?.message, 5000);
    const interests = Array.isArray(payload?.interests)
      ? payload.interests.map((item) => clean(item, 80)).filter(Boolean).slice(0, 10)
      : [];

    if (!LABELS[reachingOutAs]) return json({ error: 'Choose who you are reaching out as.' }, 400);
    if (!name) return json({ error: 'Add your name.' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Add a valid email address.' }, 400);
    if (!message) return json({ error: 'Add a short message.' }, 400);

    if (!db) return json({ error: 'Messages aren’t being accepted right now. Please email us directly.' }, 503);

    // Simple flood protection. Over the per-address limit, the message is accepted quietly but not saved again.
    let sendNotification = true;
    try {
      const { data: fromSameEmail } = await db
        .from('inquiry')
        .select('created_date')
        .eq('email', email)
        .order('created_date', { ascending: false })
        .limit(MAX_PER_EMAIL_PER_HOUR);
      if (recentCount(fromSameEmail) >= MAX_PER_EMAIL_PER_HOUR) return json({ ok: true, emailed: false });
      const { data: latest } = await db
        .from('inquiry')
        .select('created_date')
        .order('created_date', { ascending: false })
        .limit(MAX_EMAILS_PER_HOUR);
      if (recentCount(latest) >= MAX_EMAILS_PER_HOUR) sendNotification = false;
    } catch (error) {
      console.error('Inquiry rate check failed', error?.message);
    }

    const { data: record, error: saveError } = await db
      .from('inquiry')
      .insert({
        reaching_out_as: reachingOutAs,
        name,
        email,
        organization,
        interests,
        message,
        status: 'new',
        email_notified: false,
      })
      .select('id')
      .single();
    if (saveError) {
      console.error('Inquiry save failed', saveError.code || saveError.message);
      return json({ error: 'Something went wrong. Please try again.' }, 500);
    }

    let emailed = false;
    if (sendNotification && env.RESEND_API_KEY) {
      try {
        const mail = buildEmail({ reachingOutAs, name, email, organization, interests, message });
        const res = await fetchImpl('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            from: env.INQUIRY_FROM || 'Build Otherwise site <onboarding@resend.dev>',
            to: [env.INQUIRY_TO || NOTIFY_TO],
            reply_to: email,
            subject: mail.subject,
            text: mail.text,
          }),
        });
        if (res.ok) {
          emailed = true;
          await db.from('inquiry').update({ email_notified: true }).eq('id', record.id);
        } else {
          console.error('Inquiry email failed', res.status);
        }
      } catch (error) {
        console.error('Inquiry email failed', error?.message);
      }
    }

    return json({ ok: true, emailed });
  } catch (error) {
    console.error('submitInquiry failed', error?.message);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
