import type { DefaultSession } from '@auth/sveltekit';

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
    }
  }
}

export {};