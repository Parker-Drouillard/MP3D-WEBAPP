import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    error(401, 'Unauthorized');
  }

  const { orderId } = params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      stlJobs: {
        orderBy: { expiresAt: 'desc' },
        take: 1
      }
    }
  });

  if (!order) {
    error(404, 'Order not found');
  }

  if (order.userId !== locals.user.id) {
    error(403, 'Forbidden');
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      function close() {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {}
      }

      function send(data: object) {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          close();
        }
      }

      // Send initial status immediately
      const job = order.stlJobs[0];
      send({
        status: order.status,
        jobStatus: job?.status ?? null,
        downloadToken: order.downloadToken ?? null,
        jobId: job?.id ?? null,
        expiresAt: job?.expiresAt?.toISOString() ?? null
      });

      // If already terminal, close immediately
      if (order.status === 'complete' || order.status === 'failed') {
        close();
        return;
      }

      // Poll every 3 seconds until terminal state
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }

        try {
          const updated = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              stlJobs: {
                orderBy: { expiresAt: 'desc' },
                take: 1
              }
            }
          });

          if (!updated) {
            clearInterval(interval);
            close();
            return;
          }

          const updatedJob = updated.stlJobs[0];
          send({
            status: updated.status,
            jobStatus: updatedJob?.status ?? null,
            downloadToken: updated.downloadToken ?? null,
            jobId: updatedJob?.id ?? null,
            expiresAt: updatedJob?.expiresAt?.toISOString() ?? null
          });

          if (updated.status === 'complete' || updated.status === 'failed') {
            clearInterval(interval);
            close();
          }
        } catch (e) {
          console.error('[SSE] Error polling order status:', e);
          clearInterval(interval);
          close();
        }
      }, 3000);

      // Clean up if client disconnects
      return () => {
        clearInterval(interval);
        closed = true;
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
};