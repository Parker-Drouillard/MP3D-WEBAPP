import { describe, it, expect } from 'vitest';
import { buildDownloadEmailHtml, buildDownloadEmailSubject } from '$lib/server/email-template';

const PARAMS = {
  downloadUrl: 'https://example.com/api/download/job-123?token=abc',
  itemName: 'Keychain Hook',
  expiresAt: new Date('2025-06-15T12:00:00Z'),
  appUrl: 'https://example.com'
};

describe('buildDownloadEmailSubject', () => {
  it('includes the item name', () => {
    expect(buildDownloadEmailSubject('Keychain Hook')).toContain('Keychain Hook');
  });

  it('matches the expected format', () => {
    expect(buildDownloadEmailSubject('Keychain Hook')).toBe('Your STL file is ready — Keychain Hook');
  });
});

describe('buildDownloadEmailHtml', () => {
  it('contains the download URL', () => {
    const html = buildDownloadEmailHtml(PARAMS);
    expect(html).toContain(PARAMS.downloadUrl);
  });

  it('contains the item name', () => {
    const html = buildDownloadEmailHtml(PARAMS);
    expect(html).toContain(PARAMS.itemName);
  });

  it('contains the app URL', () => {
    const html = buildDownloadEmailHtml(PARAMS);
    expect(html).toContain(PARAMS.appUrl);
  });

  it('contains the expiry date string', () => {
    const html = buildDownloadEmailHtml(PARAMS);
    // Just verify some part of the formatted date appears — exact format
    // depends on the locale and timezone of the machine running the test
    expect(html).toContain('2025');
  });

  it('the download URL appears as an href', () => {
    const html = buildDownloadEmailHtml(PARAMS);
    expect(html).toContain(`href="${PARAMS.downloadUrl}"`);
  });

  it('the app URL appears as both an href and visible text', () => {
    const html = buildDownloadEmailHtml(PARAMS);
    expect(html).toContain(`href="${PARAMS.appUrl}"`);
    // Appears as visible text too
    expect(html).toContain(`>${PARAMS.appUrl}</a>`);
  });

  it('is valid HTML with opening and closing tags', () => {
    const html = buildDownloadEmailHtml(PARAMS);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('does not contain undefined or null in the output', () => {
    const html = buildDownloadEmailHtml(PARAMS);
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('null');
  });
});