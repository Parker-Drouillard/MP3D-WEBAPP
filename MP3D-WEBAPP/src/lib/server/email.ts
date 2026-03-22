import { Resend } from 'resend';
import {
	buildDownloadEmailHtml,
	buildDownloadEmailSubject,
	buildWelcomeEmailHtml,
	buildWelcomeEmailSubject
} from '$lib/server/email-template';

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
		from: `MyPhoto3D <${emailFrom}>`,
		to,
		subject: buildDownloadEmailSubject(itemName),
		html: buildDownloadEmailHtml({ downloadUrl, itemName, expiresAt, appUrl })
	});
}

export async function sendWelcomeEmail({
	to,
	pricePaidCents,
	trancheName,
	resendApiKey,
	emailFrom,
	appUrl
}: {
	to: string;
	pricePaidCents: number;
	trancheName: string;
	resendApiKey: string;
	emailFrom: string;
	appUrl: string;
}): Promise<void> {
	const resend = new Resend(resendApiKey);
	await resend.emails.send({
		from: `MyPhoto3D <${emailFrom}>`,
		to,
		subject: buildWelcomeEmailSubject(),
		html: buildWelcomeEmailHtml({ appUrl, pricePaidCents, trancheName })
	});
}