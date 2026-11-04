import { serviceClient } from './_lib/auth.js';
import { handleSubmitInquiry } from './_lib/inquiry.js';

// Open to visitors who are not signed in. Needs SUPABASE_SERVICE_ROLE_KEY on the server to save
// and rate-limit messages; without it the visitor is asked to email instead.
export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  return handleSubmitInquiry({ payload, db: serviceClient(), env: process.env, fetchImpl: fetch });
}
