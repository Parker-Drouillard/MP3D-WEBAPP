import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { verifySquareSignature } from '$lib/server/square-webhook';

const SIGNING_KEY = 'test-square-signing-key';
const WEBHOOK_URL = 'https://example.com/api/webhooks/square';
const SAMPLE_BODY = JSON.stringify({
  event_id: 'evt_001',
  type: 'payment.completed',
  data: { object: { payment: { id: 'pay_001', status: 'COMPLETED' } } }
});

function makeSignature(body: string, url = WEBHOOK_URL, key = SIGNING_KEY): string {
  return createHmac('sha256', key).update(url + body).digest('base64');
}

describe('valid signatures', () => {
  it('accepts a correctly computed signature', () => {
    const sig = makeSignature(SAMPLE_BODY);
    expect(verifySquareSignature(SAMPLE_BODY, sig, WEBHOOK_URL, SIGNING_KEY)).toBe(true);
  });

  it('accepts an empty body', () => {
    const sig = makeSignature('{}');
    expect(verifySquareSignature('{}', sig, WEBHOOK_URL, SIGNING_KEY)).toBe(true);
  });
});

describe('tampered body', () => {
  it('rejects when the body is changed', () => {
    const sig = makeSignature(SAMPLE_BODY);
    const tampered = SAMPLE_BODY.replace('payment.completed', 'payment.refunded');
    expect(verifySquareSignature(tampered, sig, WEBHOOK_URL, SIGNING_KEY)).toBe(false);
  });

  it('rejects when a character is appended to the body', () => {
    const sig = makeSignature(SAMPLE_BODY);
    expect(verifySquareSignature(SAMPLE_BODY + ' ', sig, WEBHOOK_URL, SIGNING_KEY)).toBe(false);
  });
});

describe('wrong URL', () => {
  it('rejects when the URL differs', () => {
    const sig = makeSignature(SAMPLE_BODY);
    expect(verifySquareSignature(SAMPLE_BODY, sig, 'https://evil.com/webhook', SIGNING_KEY)).toBe(false);
  });

  it('rejects when http vs https differ', () => {
    const sig = makeSignature(SAMPLE_BODY);
    const httpUrl = WEBHOOK_URL.replace('https://', 'http://');
    expect(verifySquareSignature(SAMPLE_BODY, sig, httpUrl, SIGNING_KEY)).toBe(false);
  });
});

describe('wrong signing key', () => {
  it('rejects with a different key', () => {
    const sig = makeSignature(SAMPLE_BODY);
    expect(verifySquareSignature(SAMPLE_BODY, sig, WEBHOOK_URL, 'wrong-key')).toBe(false);
  });
});

describe('malformed signatures', () => {
  it('rejects an empty signature without crashing', () => {
    expect(verifySquareSignature(SAMPLE_BODY, '', WEBHOOK_URL, SIGNING_KEY)).toBe(false);
  });

  it('rejects a hex-encoded signature (wrong encoding)', () => {
    const hexSig = createHmac('sha256', SIGNING_KEY)
      .update(WEBHOOK_URL + SAMPLE_BODY)
      .digest('hex');
    // hex is a different length than base64 — timingSafeEqual throws,
    // which the catch block must handle gracefully
    expect(verifySquareSignature(SAMPLE_BODY, hexSig, WEBHOOK_URL, SIGNING_KEY)).toBe(false);
  });

  it('rejects a truncated signature', () => {
    const sig = makeSignature(SAMPLE_BODY).slice(0, -4);
    expect(verifySquareSignature(SAMPLE_BODY, sig, WEBHOOK_URL, SIGNING_KEY)).toBe(false);
  });
});