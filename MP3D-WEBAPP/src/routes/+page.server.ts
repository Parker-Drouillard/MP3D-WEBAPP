import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	const slots = await prisma.licenseSlot.findUnique({
		where: { id: 1 },
		select: { totalSlots: true, soldCount: true }
	});

	const total = slots?.totalSlots ?? 5300;
	const sold = slots?.soldCount ?? 0;
	const remaining = total - sold;
	const percentSold = Math.round((sold / total) * 100);

	return { total, remaining, percentSold };
};