import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role?: string;
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
  }
}
