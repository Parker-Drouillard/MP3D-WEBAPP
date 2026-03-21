import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	const tranches = await prisma.tranche.findMany({
		orderBy: { order: 'asc' }
	});

	// Find the first tranche that isn't sold out
	const activeTranche = tranches.find((t) => t.soldCount < t.capacity) ?? null;

	const priceCents = activeTranche?.priceCents ?? 30000;
	const capacity = activeTranche?.capacity ?? 0;
	const soldCount = activeTranche?.soldCount ?? 0;
	const remaining = capacity - soldCount;
	const percentSold = capacity > 0 ? Math.round((soldCount / capacity) * 100) : 100;
	const priceCAD = (priceCents / 100).toFixed(0);
	const trancheName = activeTranche?.name ?? 'Full Price';

	return { priceCents, priceCAD, capacity, remaining, percentSold, trancheName };
};