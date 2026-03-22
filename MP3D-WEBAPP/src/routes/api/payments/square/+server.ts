import { json, error } from '@sveltejs/kit';
import { SquareClient, SquareEnvironment, SquareError } from 'square';
import { prisma } from '$lib/server/prisma';
import { Prisma } from '@prisma/client';
import { sendWelcomeEmail } from '$lib/server/email';
import { RESEND_API_KEY, EMAIL_FROM } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import {
	SQUARE_ACCESS_TOKEN,
	SQUARE_LOCATION_ID,
	SQUARE_ENVIRONMENT
} from '$env/static/private';
import type { RequestHandler } from './$types';

const squareClient = new SquareClient({
	token: SQUARE_ACCESS_TOKEN,
	environment:
		SQUARE_ENVIRONMENT === 'production'
			? SquareEnvironment.Production
			: SquareEnvironment.Sandbox
});

export const POST: RequestHandler = async ({ request, locals }) => {
	// Auth check
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	// Check if user already has a license
	const existingLicense = await prisma.license.findFirst({
		where: { userId: locals.user.id, status: 'active' }
	});
	if (existingLicense) {
		error(409, 'You already have an active license');
	}

	// Parse request body
	let sourceId: string;
	try {
		const body = await request.json();
		sourceId = body.sourceId;
		if (!sourceId || typeof sourceId !== 'string') {
			error(400, 'Missing sourceId');
		}
	} catch {
		error(400, 'Invalid request body');
	}

	// Step 1: Read active tranche WITHOUT a lock — just to know what to charge.
	// We re-verify inside the transaction after payment succeeds.
	const tranches = await prisma.tranche.findMany({
		orderBy: { order: 'asc' }
	});
	const activeTranche = tranches.find((t) => t.soldCount < t.capacity);

	if (!activeTranche) {
		error(410, 'Sold out');
	}

	// Step 2: Charge Square the active tranche price.
	// This happens OUTSIDE the DB transaction — never hold a lock during a network call.
	const idempotencyKey = crypto.randomUUID();
	let paymentResult;
	try {
		const response = await squareClient.payments.create({
			sourceId,
			idempotencyKey,
			amountMoney: {
				amount: BigInt(activeTranche.priceCents),
				currency: 'CAD'
			},
			locationId: SQUARE_LOCATION_ID
		});
		paymentResult = response.payment;
	} catch (e) {
		if (e instanceof SquareError) {
			console.error('Square payment error:', e.message);
			error(402, e.message ?? 'Payment failed');
		}
		throw e;
	}

	if (!paymentResult || paymentResult.status !== 'COMPLETED') {
		error(402, 'Payment was not completed');
	}

	// Step 3: Lock, re-verify, and activate — all inside one transaction.
	// The FOR UPDATE lock here is what actually prevents overselling.
	try {
		await prisma.$transaction(async (tx) => {
			// Re-read the tranche with a lock inside the transaction
      const locked = (await tx.$queryRaw(Prisma.sql`
          SELECT id, "priceCents", capacity, "soldCount"
          FROM tranches
          WHERE "soldCount" < capacity
          ORDER BY "order" ASC
          LIMIT 1
          FOR UPDATE
      `)) as { id: number; priceCents: number; capacity: number; soldCount: number }[];
			if (!locked.length) {
				// Tranche sold out between step 1 and now — need to refund
				console.error('CRITICAL: Tranche sold out after payment. Refund required.', {
					userId: locals.user!.id,
					squarePaymentId: paymentResult!.id,
					trancheId: activeTranche.id
				});
				throw new Error('SOLD_OUT_AFTER_PAYMENT');
			}

			const tranche = locked[0];

			// Increment sold count
			await tx.$executeRaw`
				UPDATE tranches
				SET "soldCount" = "soldCount" + 1
				WHERE id = ${tranche.id}
			`;

			// Record payment event
			const paymentEvent = await tx.paymentEvent.create({
				data: {
					userId: locals.user!.id,
					provider: 'square',
					providerEventId: paymentResult!.id!,
					type: 'payment.completed',
					amountCents: tranche.priceCents,
					currency: 'CAD',
					meta: {
						squarePaymentId: paymentResult!.id,
						status: paymentResult!.status,
						trancheId: tranche.id
					}
				}
			});

			// Create license
			const resetAt = new Date();
			resetAt.setMonth(resetAt.getMonth() + 1);
			await tx.license.create({
				data: {
					userId: locals.user!.id,
					status: 'active',
					paymentEventId: paymentEvent.id,
					trancheId: tranche.id,
					pricePaidCents: tranche.priceCents,
					monthlyUsage: 0,
					usageResetAt: resetAt
				}
			});
		});
	} catch (e) {
		if (e instanceof Error && e.message === 'SOLD_OUT_AFTER_PAYMENT') {
			// Payment went through but we can't give them a license.
			// This should be extremely rare. Log loudly and tell them to contact support.
			// A manual Square refund will be needed.
			error(409, 'All licenses were claimed during checkout. Your payment will be refunded. Please contact support.');
		}

		console.error('CRITICAL: Payment succeeded but license not activated', {
			userId: locals.user!.id,
			squarePaymentId: paymentResult.id
		});
		error(500, 'Payment succeeded but license activation failed. Please contact support.');
	}

	// Send welcome email — fire and forget, don't block the response
	const user = await prisma.user.findUnique({
		where: { id: locals.user.id },
		select: { email: true }
	});

	if (user?.email) {
		sendWelcomeEmail({
			to: user.email,
			pricePaidCents: activeTranche.priceCents,
			trancheName: activeTranche.name,
			resendApiKey: RESEND_API_KEY,
			emailFrom: EMAIL_FROM,
			appUrl: PUBLIC_APP_URL
		}).catch((e) => {
			console.error('[payment] Welcome email failed:', e);
		});
	}

	return json({ success: true });
};