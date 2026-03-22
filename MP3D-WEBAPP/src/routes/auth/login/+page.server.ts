import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		// Already signed in — send them somewhere useful
		if (locals.license) {
			redirect(302, '/catalog');
		} else {
			redirect(302, '/buy');
		}
	}

	// Pass through the redirectTo param so we can use it after sign in
	const redirectTo = url.searchParams.get('redirectTo') ?? '/catalog';
	return { redirectTo };
};