import { json, error } from '@sveltejs/kit';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '$lib/server/prisma';
import { SQUARE_WEBHOOK_SIGNATURE_KEY } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import type { RequestHandler } from './$types';
import { verifySquareSignature } from '$lib/server/square-webhook';


export const POST: RequestHandler = async ({ request }) => {
  // 1. Read raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get('x-square-hmacsha256-signature');

  if (!signature) {
    error(400, 'Missing signature');
  }

  // 2. Verify signature before doing anything else
  const webhookUrl = `${PUBLIC_APP_URL}/api/webhooks/square`;
  const isValid = verifySquareSignature(rawBody, signature, webhookUrl, SQUARE_WEBHOOK_SIGNATURE_KEY);

  if (!isValid) {
    console.warn('[webhook] Invalid Square signature received');
    error(403, 'Invalid signature');
  }

  // 3. Parse the event
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    error(400, 'Invalid JSON');
  }

  const eventType = event?.type;
  const eventId = event?.event_id;

  if (!eventId || !eventType) {
    error(400, 'Missing event_id or type');
  }

  // 4. Idempotency check — ignore duplicate events
  const existing = await prisma.paymentEvent.findUnique({
    where: { providerEventId: eventId }
  });

  if (existing) {
    console.log(`[webhook] Duplicate event ${eventId} ignored`);
    return json({ received: true });
  }

  // 5. Handle relevant event types
  if (eventType === 'payment.completed') {
    const payment = event?.data?.object?.payment;

    if (!payment) {
      error(400, 'Missing payment object');
    }

    const squarePaymentId = payment.id;
    const amountCents = Number(payment.amount_money?.amount ?? 0);
    const currency = payment.amount_money?.currency ?? 'CAD';
    const buyerId = payment.customer_id ?? null;

    // Find the user by matching the payment — Square doesn't give us our
    // internal user ID directly, so we look up by the payment reference
    // In production this would be enriched with customer data from Square
    const paymentEvent = await prisma.paymentEvent.create({
      data: {
        provider: 'square',
        providerEventId: eventId,
        type: eventType,
        amountCents,
        currency,
        meta: {
          squarePaymentId,
          buyerId,
          raw: event
        }
      }
    });

    console.log(`[webhook] Payment event ${eventId} recorded`);

    // Note: license activation is handled synchronously in the payment API
    // route. The webhook serves as a backup confirmation and audit trail.
    // If a license wasn't activated (e.g. our server crashed mid-request),
    // this is where we'd detect and fix that — but that logic requires
    // matching the Square payment to an internal user, which needs the
    // customer_id to be stored at checkout time. This is a Phase 7 hardening item.
  } else {
    // Log unhandled event types for visibility
    console.log(`[webhook] Unhandled event type: ${eventType}`);
  }

  // Always return 200 quickly — Square will retry if we don't
  return json({ received: true });
};