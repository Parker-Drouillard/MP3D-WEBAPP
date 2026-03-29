import type { DefaultSession } from '@auth/sveltekit';
import type { License } from '@prisma/client';

declare module '@auth/sveltekit' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
      };
      license: License | null;
    }
  }
}

export {};