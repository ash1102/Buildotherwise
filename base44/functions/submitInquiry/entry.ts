import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const NOTIFY_TO = 'Start@buildotherwise.org';

const LABELS = {
  partner: 'Partner organization',
  volunteer: 'Volunteer',
  fiscal_sponsor: 'Fiscal sponsor or funder',
  participant: 'Interested in the program',
  other: 'Something else',
};

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

// One line, no control characters: for anything placed in an email subject or header-like line.
function oneLine(value) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const HOUR_MS = 60 * 60 * 1000;
const MAX_PER_EMAIL_PER_HOUR = 3; // the same address can send a few messages an hour
const MAX_EMAILS_PER_HOUR = 20; // past this, messages are still saved but no notification email goes out

function recentCount(records) {
  const cutoff = Date.now() - HOUR_MS;
  return (records || []).filter((r) => r?.created_date && new Date(r.created_date).getTime() > cutoff).length;
}

/**
 * Saves a Get Involved inquiry and emails Start@buildotherwise.org about it.
 * Open to visitors who are not signed in. The record is saved even if the email fails.
 */
export default async function (req) {
  try {
    if (req.method !== 'POST') return Response.json({ error: 'Use POST' }, { status: 405 });
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));

    // Hidden field that people never see. Bots fill it in.
    if (clean(payload.website, 200)) return Response.json({ ok: true, emailed: false });

    const reachingOutAs = clean(payload.reaching_out_as, 40);
    const name = clean(payload.name, 200);
    const email = clean(payload.email, 320);
    const organization = clean(payload.organization, 300);
    const message = clean(payload.message, 5000);
    const interests = Array.isArray(payload.interests)
      ? payload.interests.map((item) => clean(item, 80)).filter(Boolean).slice(0, 10)
      : [];

    if (!LABELS[reachingOutAs]) return Response.json({ error: 'Choose who you are reaching out as.' }, { status: 400 });
    if (!name) return Response.json({ error: 'Add your name.' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Add a valid email address.' }, { status: 400 });
    if (!message) return Response.json({ error: 'Add a short message.' }, { status: 400 });

    // Simple flood protection. Over the per-address limit, the message is accepted quietly but not saved again.
    let sendNotification = true;
    try {
      const fromSameEmail = await base44.asServiceRole.entities.Inquiry.filter({ email }, '-created_date', MAX_PER_EMAIL_PER_HOUR);
      if (recentCount(fromSameEmail) >= MAX_PER_EMAIL_PER_HOUR) return Response.json({ ok: true, emailed: false });
      const latest = await base44.asServiceRole.entities.Inquiry.list('-created_date', MAX_EMAILS_PER_HOUR);
      if (recentCount(latest) >= MAX_EMAILS_PER_HOUR) sendNotification = false;
    } catch (error) {
      console.error('Inquiry rate check failed', error?.message);
    }

    const record = await base44.asServiceRole.entities.Inquiry.create({
      reaching_out_as: reachingOutAs,
      name,
      email,
      organization,
      interests,
      message,
      status: 'new',
      email_notified: false,
    });

    let emailed = false;
    if (sendNotification) try {
      const lines = [
        `New Get Involved message from the Build Otherwise site.`,
        ``,
        `Reaching out as: ${LABELS[reachingOutAs]}`,
        `Name: ${oneLine(name)}`,
        `Email: ${email}`,
        organization ? `Organization: ${oneLine(organization)}` : null,
        interests.length ? `Would like to help with: ${interests.join(', ')}` : null,
        ``,
        message,
      ].filter((line) => line !== null);
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: NOTIFY_TO,
        subject: `Get Involved: ${LABELS[reachingOutAs]}, ${oneLine(name).slice(0, 80)}`,
        body: lines.join('\n'),
        from_name: 'Build Otherwise site',
      });
      emailed = true;
      await base44.asServiceRole.entities.Inquiry.update(record.id, { email_notified: true });
    } catch (error) {
      console.error('Inquiry email failed', error?.message);
    }

    return Response.json({ ok: true, emailed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
