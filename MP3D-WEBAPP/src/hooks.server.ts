import { handle as authHandle } from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import { prisma } from '$lib/server/prisma';
import type { Handle } from '@sveltejs/kit';

const appHandle: Handle = async ({ event, resolve }) => {
  const session = await event.locals.auth();

  if (session?.user?.id) {
    const license = await prisma.license.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      }
    });

    event.locals.user = {
      id: session.user.id,
      email: session.user.email ?? ''
    };

    event.locals.license = license ?? null;
  } else {
    event.locals.user = undefined;
    event.locals.license = null;
  }

  return resolve(event);
};

export const handle = sequence(authHandle, appHandle);