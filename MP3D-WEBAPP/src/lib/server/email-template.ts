const BRAND_COLOR = '#C8522A';
const INK = '#1A1714';
const INK_MID = '#6B6560';
const INK_LIGHT = '#B5B0AA';
const RULE = '#E2DED8';
const CREAM = '#FAF8F4';

function emailWrapper(content: string, appUrl: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>MyPhoto3D</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding:2rem 1rem;">
        <table role="presentation" width="100%" style="max-width:580px;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:1.5rem;border-bottom:1px solid ${RULE};">
              <a href="${appUrl}" style="text-decoration:none;font-size:1.25rem;color:${INK};font-weight:400;letter-spacing:-0.01em;">
                MyPhoto<span style="color:${BRAND_COLOR};">3D</span>
              </a>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:2rem 0;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:1.5rem;border-top:1px solid ${RULE};">
              <p style="margin:0 0 0.5rem;font-size:0.75rem;color:${INK_LIGHT};">
                MyPhoto3D · Operated by Parker Drouillard · 130 Vermont St., LaSalle ON N9J 1C9              </p>
              <p style="margin:0 0 0.5rem;font-size:0.75rem;color:${INK_LIGHT};">
                You received this email because you have an account at
                <a href="${appUrl}" style="color:${INK_LIGHT};">${appUrl.replace('https://', '')}</a>.
              </p>
              <p style="margin:0;font-size:0.75rem;color:${INK_LIGHT};">
                <a href="${appUrl}/terms" style="color:${INK_LIGHT};">Terms of Service</a>
                &nbsp;·&nbsp;
                <a href="${appUrl}/privacy" style="color:${INK_LIGHT};">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="mailto:support@myphoto3d.com" style="color:${INK_LIGHT};">support@myphoto3d.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Download email ────────────────────────────────────────────────────────────

export function buildDownloadEmailSubject(itemName: string): string {
	return `Your STL file is ready — ${itemName}`;
}

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
	const expiryString = expiresAt.toLocaleDateString('en-CA', {
		timeZone: 'America/Toronto',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const content = `
    <h1 style="margin:0 0 0.75rem;font-size:1.5rem;font-weight:400;color:${INK};letter-spacing:-0.02em;">
      Your STL file is ready
    </h1>
    <p style="margin:0 0 1.5rem;font-size:0.9375rem;color:${INK_MID};line-height:1.6;">
      Your <strong style="color:${INK};font-weight:500;">${itemName}</strong> file has been
      generated and is ready to download. Print it on any FDM printer and place a light
      source behind it to reveal your photo.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 1.5rem;">
      <tr>
        <td style="background:${INK};border-radius:2px;">
          <a href="${downloadUrl}"
             style="display:inline-block;padding:0.875rem 2rem;color:#FAF8F4;text-decoration:none;font-size:0.9375rem;font-weight:400;letter-spacing:0.01em;">
            Download STL file
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 1.5rem;font-size:0.8125rem;color:${INK_LIGHT};line-height:1.6;">
      This link expires on ${expiryString}. After this date the file will no longer be
      available — make sure to download it before then.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid ${RULE};border-left:3px solid ${BRAND_COLOR};border-radius:2px;margin:0 0 1rem;">
      <tr>
        <td style="padding:1rem 1.25rem;">
          <p style="margin:0;font-size:0.8125rem;color:${INK_MID};line-height:1.6;">
            <strong style="color:${INK};font-weight:500;">Your photos have been deleted.</strong>
            As per our privacy policy, all uploaded photos are removed from our servers
            within 24 hours of your order being processed.
          </p>
        </td>
      </tr>
    </table>
  `;

	return emailWrapper(content, appUrl);
}

// ── Welcome / purchase confirmation email ─────────────────────────────────────

export function buildWelcomeEmailSubject(): string {
	return `Welcome to MyPhoto3D — your license is active`;
}

export function buildWelcomeEmailHtml({
	appUrl,
	pricePaidCents,
	trancheName
}: {
	appUrl: string;
	pricePaidCents: number;
	trancheName: string;
}): string {
	const priceCAD = (pricePaidCents / 100).toFixed(0);

	const content = `
    <h1 style="margin:0 0 0.75rem;font-size:1.5rem;font-weight:400;color:${INK};letter-spacing:-0.02em;">
      Welcome to MyPhoto3D
    </h1>
    <p style="margin:0 0 1.5rem;font-size:0.9375rem;color:${INK_MID};line-height:1.6;">
      Your lifetime license is now active. You can start generating STL files immediately
      — browse the catalog, upload your photos, and we'll deliver your file by email and
      direct download.
    </p>

    <!-- Purchase summary -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid ${RULE};border-radius:2px;margin:0 0 1.5rem;">
      <tr>
        <td style="padding:1.25rem 1.5rem;border-bottom:1px solid ${RULE};">
          <p style="margin:0;font-size:0.6875rem;letter-spacing:0.1em;text-transform:uppercase;color:${INK_LIGHT};">
            Purchase summary
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:1rem 1.5rem;border-bottom:1px solid ${RULE};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:0.875rem;color:${INK_MID};">License type</td>
              <td align="right" style="font-size:0.875rem;color:${INK};">Lifetime — ${trancheName}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:1rem 1.5rem;border-bottom:1px solid ${RULE};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:0.875rem;color:${INK_MID};">Amount paid</td>
              <td align="right" style="font-size:0.875rem;color:${INK};">$${priceCAD} CAD</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:1rem 1.5rem;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:0.875rem;color:${INK_MID};">Access</td>
              <td align="right" style="font-size:0.875rem;color:${INK};">Lifetime — no expiry</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 1.5rem;">
      <tr>
        <td style="background:${INK};border-radius:2px;">
          <a href="${appUrl}/catalog"
             style="display:inline-block;padding:0.875rem 2rem;color:#FAF8F4;text-decoration:none;font-size:0.9375rem;font-weight:400;letter-spacing:0.01em;">
            Browse the catalog
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:0.8125rem;color:${INK_LIGHT};line-height:1.6;">
      Questions? Reply to this email or contact us at
      <a href="mailto:support@myphoto3d.com" style="color:${INK_LIGHT};">support@myphoto3d.com</a>.
      Please keep this email as a record of your purchase.
    </p>
  `;

	return emailWrapper(content, appUrl);
}