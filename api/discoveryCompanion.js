import { authenticate } from './_lib/auth.js';
import { handleCompanion } from './_lib/companion.js';

export async function POST(request) {
  const rawBody = await request.text();
  return handleCompanion({ rawBody, auth: await authenticate(request), env: process.env, fetchImpl: fetch });
}
