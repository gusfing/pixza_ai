import { DefaultSession } from "next-auth";
import { Plan, Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan?: Plan;
      role?: Role;
    } & DefaultSession["user"];
  }

  interface User {
    plan?: Plan;
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan?: Plan;
    role?: Role;
  }
}
