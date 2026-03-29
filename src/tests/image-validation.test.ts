import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { validateAndNormalizeImage } from '$lib/server/image-validation';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function makeJpegBuffer(): Promise<Buffer> {
  return sharp({
    create: { width: 1, height: 1, channels: 3, background: { r: 255, g: 0, b: 0 } }
  }).jpeg().toBuffer();
}

async function makePngBuffer(): Promise<Buffer> {
  return sharp({
    create: { width: 1, height: 1, channels: 4, background: { r: 0, g: 255, b: 0, alpha: 1 } }
  }).png().toBuffer();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('JPEG', () => {
  it('accepts a real JPEG buffer and returns ext: jpg', async () => {
    const buf = await makeJpegBuffer();
    const result = await validateAndNormalizeImage(buf);
    expect(result).not.toBeNull();
    expect(result!.ext).toBe('jpg');
  });

  it('returns the same buffer unchanged (no conversion)', async () => {
    const buf = await makeJpegBuffer();
    const result = await validateAndNormalizeImage(buf);
    expect(result!.buffer).toBe(buf);
  });
});

describe('PNG', () => {
  it('accepts a real PNG buffer and returns ext: png', async () => {
    const buf = await makePngBuffer();
    const result = await validateAndNormalizeImage(buf);
    expect(result).not.toBeNull();
    expect(result!.ext).toBe('png');
  });
});

describe('HEIC', () => {
  it('detects ftyp magic bytes at offset 4', async () => {
    const buf = Buffer.alloc(12);
    buf.write('ftyp', 4, 'ascii');
    const result = await validateAndNormalizeImage(buf);
    expect(result).toBeNull();
  });

  it('does not detect HEIC when ftyp is at offset 0 instead of 4', async () => {
    const buf = Buffer.alloc(12);
    buf.write('ftyp', 0, 'ascii');
    const result = await validateAndNormalizeImage(buf);
    expect(result).toBeNull();
  });

  it('does not detect HEIC for a buffer of 8 bytes or fewer', async () => {
    const buf = Buffer.alloc(8);
    buf.write('ftyp', 4, 'ascii');
    const result = await validateAndNormalizeImage(buf);
    expect(result).toBeNull();
  });
});

describe('invalid formats', () => {
  it('rejects an empty buffer', async () => {
    expect(await validateAndNormalizeImage(Buffer.alloc(0))).toBeNull();
  });

  it('rejects random bytes', async () => {
    expect(await validateAndNormalizeImage(Buffer.from([0x00, 0x01, 0x02, 0x03]))).toBeNull();
  });

  it('rejects a GIF', async () => {
    const gif = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
    expect(await validateAndNormalizeImage(gif)).toBeNull();
  });

  it('rejects a PDF', async () => {
    expect(await validateAndNormalizeImage(Buffer.from('%PDF-1.4'))).toBeNull();
  });
});