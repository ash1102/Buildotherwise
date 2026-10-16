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
    try {
      const lines = [
        `New Get Involved message from the Build Otherwise site.`,
        ``,
        `Reaching out as: ${LABELS[reachingOutAs]}`,
        `Name: ${name}`,
        `Email: ${email}`,
        organization ? `Organization: ${organization}` : null,
        interests.length ? `Would like to help with: ${interests.join(', ')}` : null,
        ``,
        message,
      ].filter((line) => line !== null);
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: NOTIFY_TO,
        subject: `Get Involved: ${LABELS[reachingOutAs]}, ${name}`,
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
