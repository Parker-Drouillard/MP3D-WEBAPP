import { handle as authHandle } from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

const appHandle: Handle = async ({ event, resolve }) => {
  return resolve(event);
};

export const handle = sequence(authHandle, appHandle);