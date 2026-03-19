import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { FAIR_USE_MONTHLY_LIMIT } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    redirect(302, '/auth/login');
  }

  const license = await prisma.license.findFirst({
    where: { userId: locals.user.id, status: 'active' }
  });

  const orders = await prisma.order.findMany({
    where: { userId: locals.user.id },
    include: {
      stlJobs: {
        orderBy: { expiresAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return {
    user: locals.user,
    license: license
      ? {
          id: license.id,
          status: license.status,
          monthlyUsage: license.monthlyUsage,
          usageResetAt: license.usageResetAt.toISOString(),
          createdAt: license.createdAt.toISOString()
        }
      : null,
    fairUseLimit: parseInt(FAIR_USE_MONTHLY_LIMIT, 10),
    orders: orders.map((order) => {
      const job = order.stlJobs[0];
      return {
        id: order.id,
        itemSlug: order.itemSlug,
        status: order.status,
        deliveryMethod: order.deliveryMethod,
        createdAt: order.createdAt.toISOString(),
        downloadToken: order.downloadToken ?? null,
        job: job
          ? {
              id: job.id,
              status: job.status,
              expiresAt: job.expiresAt.toISOString(),
              filesDeleted: job.filesDeleted
            }
          : null
      };
    })
  };
};