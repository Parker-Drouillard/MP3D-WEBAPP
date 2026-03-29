import { describe, it, expect } from 'vitest';
import { generateDownloadToken, validateDownloadToken } from '$lib/server/download-token';

const SECRET = 'test-secret-32-bytes-long-enough!!';
const JOB_ID = '550e8400-e29b-41d4-a716-446655440000';
const OTHER_JOB_ID = '660e8400-e29b-41d4-a716-446655440000';

// Fixed dates used across tests
const FUTURE_EXPIRY = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // 7 days from now
const PAST_EXPIRY = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);    // 7 days ago

describe('round-trip', () => {
  it('produces a valid, non-expired token', () => {
    const token = generateDownloadToken(JOB_ID, FUTURE_EXPIRY, SECRET);
    const result = validateDownloadToken(token, JOB_ID, SECRET);
    expect(result).toEqual({ valid: true, expired: false });
  });

  it('produces a base64url string (no +, /, or = characters)', () => {
    const token = generateDownloadToken(JOB_ID, FUTURE_EXPIRY, SECRET);
    expect(token).not.toMatch(/[+/=]/);
  });
});

describe('expiry', () => {
  it('returns expired: true for a token with a past expiry date', () => {
    const token = generateDownloadToken(JOB_ID, PAST_EXPIRY, SECRET);
    const result = validateDownloadToken(token, JOB_ID, SECRET);
    expect(result).toEqual({ valid: true, expired: true });
  });

  it('returns expired: false for a token with a future expiry date', () => {
    const token = generateDownloadToken(JOB_ID, FUTURE_EXPIRY, SECRET);
    const result = validateDownloadToken(token, JOB_ID, SECRET);
    expect(result).toEqual({ valid: true, expired: false });
  });
});

describe('rejection', () => {
  it('rejects a token validated against the wrong job ID', () => {
    const token = generateDownloadToken(JOB_ID, FUTURE_EXPIRY, SECRET);
    expect(validateDownloadToken(token, OTHER_JOB_ID, SECRET).valid).toBe(false);
  });

  it('rejects a token validated with the wrong secret', () => {
    const token = generateDownloadToken(JOB_ID, FUTURE_EXPIRY, SECRET);
    expect(validateDownloadToken(token, JOB_ID, 'wrong-secret').valid).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validateDownloadToken('', JOB_ID, SECRET)).toEqual({ valid: false, expired: false });
  });

  it('rejects a tampered signature', () => {
    const token = generateDownloadToken(JOB_ID, FUTURE_EXPIRY, SECRET);
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
    expect(validateDownloadToken(tampered, JOB_ID, SECRET).valid).toBe(false);
  });

  it('rejects a tampered expiry in the payload', () => {
    const token = generateDownloadToken(JOB_ID, FUTURE_EXPIRY, SECRET);
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    parts[1] = (Date.now() + 999_999_999_999).toString();
    const tampered = Buffer.from(parts.join(':')).toString('base64url');
    expect(validateDownloadToken(tampered, JOB_ID, SECRET).valid).toBe(false);
  });
});