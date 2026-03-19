import { json, error } from '@sveltejs/kit';
import { SquareClient, SquareEnvironment, SquareError } from 'square';
import { prisma } from '$lib/server/prisma';
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

  const slots = await prisma.$queryRaw<{ soldCount: number; totalSlots: number }[]>`
    SELECT "soldCount", "totalSlots" 
    FROM license_slots 
    WHERE id = 1 
    FOR UPDATE
  `;

  if (!slots.length || slots[0].soldCount >= slots[0].totalSlots) {
    error(410, 'Sold out');
  }

  // Process payment with Square
  const idempotencyKey = crypto.randomUUID();

  let paymentResult;
  try {
    const response = await squareClient.payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(30000), // $300.00 CAD in cents
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

  // Activate license inside a transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Increment sold count
      await tx.$executeRaw`
        UPDATE license_slots 
        SET "soldCount" = "soldCount" + 1 
        WHERE id = 1
      `;

      // Record payment event
      const paymentEvent = await tx.paymentEvent.create({
        data: {
          userId: locals.user!.id,
          provider: 'square',
          providerEventId: paymentResult!.id!,
          type: 'payment.completed',
          amountCents: 30000,
          currency: 'CAD',
          meta: {
            squarePaymentId: paymentResult!.id,
            status: paymentResult!.status
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
          monthlyUsage: 0,
          usageResetAt: resetAt
        }
      });
    });
  } catch (e) {
    console.error('CRITICAL: Payment succeeded but license not activated', {
      userId: locals.user!.id,
      squarePaymentId: paymentResult.id
    });
    error(500, 'Payment succeeded but license activation failed. Please contact support.');
  }

  return json({ success: true });
};