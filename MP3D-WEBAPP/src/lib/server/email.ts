import { Resend } from 'resend';
import { buildDownloadEmailHtml, buildDownloadEmailSubject } from '$lib/server/email-template';

export async function sendDownloadEmail({
  to,
  downloadUrl,
  itemName,
  expiresAt,
  resendApiKey,
  emailFrom,
  appUrl
}: {
  to: string;
  downloadUrl: string;
  itemName: string;
  expiresAt: Date;
  resendApiKey: string;
  emailFrom: string;
  appUrl: string;
}): Promise<void> {
  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: emailFrom,
    to,
    subject: buildDownloadEmailSubject(itemName),
    html: buildDownloadEmailHtml({ downloadUrl, itemName, expiresAt, appUrl })
  });
}