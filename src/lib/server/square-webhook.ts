import { createHmac, timingSafeEqual } from 'crypto';

export function verifySquareSignature(
  body: string,
  signature: string,
  webhookUrl: string,
  signingKey: string
): boolean {
  const hmac = createHmac('sha256', signingKey);
  hmac.update(webhookUrl + body);
  const expected = hmac.digest('base64');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}