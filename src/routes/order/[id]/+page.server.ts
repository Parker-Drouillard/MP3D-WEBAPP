import { redirect, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    redirect(302, '/auth/login');
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
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

  const job = order.stlJobs[0];

  return {
    order: {
      id: order.id,
      status: order.status,
      itemSlug: order.itemSlug,
      deliveryMethod: order.deliveryMethod,
      createdAt: order.createdAt.toISOString(),
      downloadToken: order.downloadToken ?? null
    },
    job: job
      ? {
          id: job.id,
          status: job.status,
          expiresAt: job.expiresAt.toISOString(),
          filesDeleted: job.filesDeleted
        }
      : null
  };
};