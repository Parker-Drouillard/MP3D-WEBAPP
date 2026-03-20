import { createHmac, timingSafeEqual } from 'crypto';

export function generateDownloadToken(
  jobId: string,
  expiresAt: Date,
  secret: string
): string {
  const expiry = expiresAt.getTime().toString();
  const payload = `${jobId}:${expiry}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export function validateDownloadToken(
  token: string,
  jobId: string,
  secret: string
): { valid: boolean; expired: boolean } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');

    if (parts.length !== 3) return { valid: false, expired: false };

    const [tokenJobId, expiry, sig] = parts;

    if (tokenJobId !== jobId) return { valid: false, expired: false };

    const payload = `${tokenJobId}:${expiry}`;
    const expected = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (sig.length !== expected.length) return { valid: false, expired: false };

    const sigValid = timingSafeEqual(
      Buffer.from(sig, 'hex'),
      Buffer.from(expected, 'hex')
    );

    if (!sigValid) return { valid: false, expired: false };

    const expiryMs = parseInt(expiry, 10);
    const expired = Date.now() > expiryMs;

    return { valid: true, expired };
  } catch {
    return { valid: false, expired: false };
  }
}