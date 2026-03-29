import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import { PUBLIC_SQUARE_LOCATION_ID } from '$env/static/public';

export const load: PageServerLoad = async ({ locals }) => {
	const tranches = await prisma.tranche.findMany({
		orderBy: { order: 'asc' }
	});

	const activeTranche = tranches.find((t) => t.soldCount < t.capacity) ?? null;

	const soldOut = !activeTranche;
	const remaining = activeTranche ? activeTranche.capacity - activeTranche.soldCount : 0;
	const capacity = activeTranche?.capacity ?? 0;
	const priceCents = activeTranche?.priceCents ?? 30000;
	const priceCAD = (priceCents / 100).toFixed(0);
	const trancheName = activeTranche?.name ?? 'Full Price';
	const percentSold = capacity > 0 ? Math.round((activeTranche!.soldCount / capacity) * 100) : 100;

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
		capacity,
		priceCents,
		priceCAD,
		trancheName,
		percentSold,
		hasLicense,
		isLoggedIn: !!locals.user,
		locationId: PUBLIC_SQUARE_LOCATION_ID
	};
};