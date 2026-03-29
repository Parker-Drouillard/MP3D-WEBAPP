import { redirect } from '@sveltejs/kit';
import { catalog } from '$lib/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    redirect(302, '/auth/login');
  }

  if (!locals.license) {
    redirect(302, '/buy');
  }

  return {
    items: catalog
  };
};