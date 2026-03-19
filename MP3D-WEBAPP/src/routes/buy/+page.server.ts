import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import { PUBLIC_SQUARE_LOCATION_ID } from '$env/static/public';

export const load: PageServerLoad = async ({ locals }) => {
  // Check if slots are available
  const slots = await prisma.licenseSlot.findUnique({
    where: { id: 1 }
  });

  const soldOut = !slots || slots.soldCount >= slots.totalSlots;
  const remaining = slots ? slots.totalSlots - slots.soldCount : 0;

  // Check if user already has a license
  let hasLicense = false;
  if (locals.user) {
    const license = await prisma.license.findFirst({
      where: { userId: locals.user.id, status: 'active' }
    });
    hasLicense = !!license;
  }

    return {
    soldOut,
    remaining,
    hasLicense,
    isLoggedIn: !!locals.user,
    locationId: PUBLIC_SQUARE_LOCATION_ID
  };
};