export function buildDownloadEmailHtml({
  downloadUrl,
  itemName,
  expiresAt,
  appUrl
}: {
  downloadUrl: string;
  itemName: string;
  expiresAt: Date;
  appUrl: string;
}): string {
  const expiryString = expiresAt.toLocaleString('en-CA', {
    timeZone: 'America/Toronto',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Your STL file is ready</h1>
        <p>Your <strong>${itemName}</strong> STL file has been generated and is ready to download.</p>
        <p style="margin: 2rem 0;">
          <a 
            href="${downloadUrl}" 
            style="background: #111; color: #fff; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-size: 1rem;"
          >
            Download STL File
          </a>
        </p>
        <p style="color: #888; font-size: 0.85rem;">
          This link expires on ${expiryString}. After that, the file will no longer be available.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 2rem 0;">
        <p style="color: #888; font-size: 0.8rem;">
          You received this email because you requested an STL generation on 
          <a href="${appUrl}" style="color: #888;">${appUrl}</a>.
        </p>
      </body>
    </html>
  `;
}

export function buildDownloadEmailSubject(itemName: string): string {
  return `Your STL file is ready — ${itemName}`;
}