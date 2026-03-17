import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from '@auth/sveltekit/providers/google';
import GitHub from '@auth/sveltekit/providers/github';
import { prisma } from '$lib/server/prisma';
import {
  AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET,
  AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET
} from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({ clientId: AUTH_GOOGLE_ID, clientSecret: AUTH_GOOGLE_SECRET }),
    GitHub({ clientId: AUTH_GITHUB_ID, clientSecret: AUTH_GITHUB_SECRET })
  ],
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    }
  }
});