import { redirect, error } from '@sveltejs/kit';
import { getItem } from '$lib/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    redirect(302, '/auth/login');
  }

  if (!locals.license) {
    redirect(302, '/buy');
  }

  const item = getItem(params.slug);

  if (!item) {
    error(404, 'Item not found');
  }

  return {
    item,
    license: {
      monthlyUsage: locals.license.monthlyUsage,
      usageResetAt: locals.license.usageResetAt.toISOString()
    }
  };
};