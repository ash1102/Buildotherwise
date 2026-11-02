import { authenticate } from './_lib/auth.js';
import { handleReflection } from './_lib/reflection.js';

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  return handleReflection({ payload, auth: await authenticate(request), env: process.env, fetchImpl: fetch });
}
