import { authenticate } from './_lib/auth.js';
import { handleAnswerFeedback } from './_lib/feedback.js';

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  return handleAnswerFeedback({ payload, auth: await authenticate(request), env: process.env, fetchImpl: fetch });
}
