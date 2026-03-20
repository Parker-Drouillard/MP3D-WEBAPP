import sharp from 'sharp';

const MAGIC_BYTES = {
  jpeg: { bytes: [0xff, 0xd8, 0xff], offset: 0 },
  png:  { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
  heic: { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }
} as const;

export async function validateAndNormalizeImage(
  buffer: Buffer
): Promise<{ buffer: Buffer; ext: string } | null> {
  const isJpeg = MAGIC_BYTES.jpeg.bytes.every(
    (byte, i) => buffer[i + MAGIC_BYTES.jpeg.offset] === byte
  );
  if (isJpeg) return { buffer, ext: 'jpg' };

  const isPng = MAGIC_BYTES.png.bytes.every(
    (byte, i) => buffer[i + MAGIC_BYTES.png.offset] === byte
  );
  if (isPng) return { buffer, ext: 'png' };

  const isHeic =
    buffer.length > 8 &&
    MAGIC_BYTES.heic.bytes.every(
      (byte, i) => buffer[i + MAGIC_BYTES.heic.offset] === byte
    );

  if (isHeic) {
    try {
      const converted = await sharp(buffer).jpeg({ quality: 92 }).toBuffer();
      return { buffer: converted, ext: 'jpg' };
    } catch {
      return null;
    }
  }

  return null;
}