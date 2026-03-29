import { describe, it, expect } from 'vitest';
import {
  needsReset,
  nextResetDate,
  newUsageAfterRequest,
  isLimitExceeded,
  fairUseStatus
} from '$lib/server/fair-use';

describe('needsReset', () => {
  it('returns false when reset date is in the future', () => {
    const now = new Date('2025-06-01T12:00:00Z');
    const resetAt = new Date('2025-06-15T12:00:00Z');
    expect(needsReset(now, resetAt)).toBe(false);
  });

  it('returns true when now equals the reset date exactly', () => {
    const ts = new Date('2025-06-15T12:00:00Z');
    expect(needsReset(ts, ts)).toBe(true);
  });

  it('returns true when now is past the reset date', () => {
    const now = new Date('2025-07-01T00:00:00Z');
    const resetAt = new Date('2025-06-15T12:00:00Z');
    expect(needsReset(now, resetAt)).toBe(true);
  });

  it('returns false 1ms before the reset date', () => {
    const resetAt = new Date('2025-06-15T12:00:00.000Z');
    const now = new Date(resetAt.getTime() - 1);
    expect(needsReset(now, resetAt)).toBe(false);
  });
});

describe('nextResetDate', () => {
  it('advances the month by one', () => {
    const now = new Date('2025-06-20T10:00:00Z');
    const resetAt = new Date(2025, 5, 15, 8, 30, 0); // June 15
    const next = nextResetDate(now, resetAt);
    expect(next.getMonth()).toBe(6); // July
  });

  it('preserves the day-of-month from the original reset', () => {
    const now = new Date('2025-06-20T10:00:00Z');
    const resetAt = new Date(2025, 5, 15, 8, 30, 0);
    expect(nextResetDate(now, resetAt).getDate()).toBe(15);
  });

  it('preserves the original time of day', () => {
    const now = new Date('2025-06-20T10:00:00Z');
    const resetAt = new Date(2025, 5, 15, 8, 30, 45);
    const next = nextResetDate(now, resetAt);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(30);
    expect(next.getSeconds()).toBe(45);
  });

  it('handles December → January year rollover', () => {
    const now = new Date('2025-12-20T10:00:00Z');
    const resetAt = new Date(2025, 11, 1, 0, 0, 0); // Dec 1
    const next = nextResetDate(now, resetAt);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(0); // January
  });
});

describe('newUsageAfterRequest', () => {
  it('resets to 1 when reset is true', () => {
    expect(newUsageAfterRequest(42, true)).toBe(1);
  });

  it('increments by 1 when reset is false', () => {
    expect(newUsageAfterRequest(5, false)).toBe(6);
  });
});

describe('isLimitExceeded', () => {
  it('returns false when usage equals the limit exactly', () => {
    expect(isLimitExceeded(10, 10)).toBe(false);
  });

  it('returns true when usage is one over the limit', () => {
    expect(isLimitExceeded(11, 10)).toBe(true);
  });
});

describe('fairUseStatus', () => {
  it('returns good at 0 usage', () => {
    expect(fairUseStatus(0, 10)).toBe('good');
  });

  it('returns good below 80%', () => {
    expect(fairUseStatus(7, 10)).toBe('good'); // 70%
  });

  it('returns warning at exactly 80%', () => {
    expect(fairUseStatus(8, 10)).toBe('warning'); // 80%
  });

  it('returns exceeded at exactly 100%', () => {
    expect(fairUseStatus(10, 10)).toBe('exceeded');
  });

  it('returns exceeded above the limit', () => {
    expect(fairUseStatus(12, 10)).toBe('exceeded');
  });
});