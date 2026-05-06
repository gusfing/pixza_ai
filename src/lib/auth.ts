import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // After Google login, redirect to WP sync endpoint
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: (user as any).role };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-in, allow it — WP sync happens via redirect
      if (account?.provider === "google") {
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        try {
          const dbUser = await db.user.findUnique({ where: { id: user.id } });
          token.plan = (dbUser as any)?.plan ?? "FREE";
          token.role = (dbUser as any)?.role ?? "USER";
        } catch {
          token.plan = "FREE";
          token.role = "USER";
        }
      }
      if (account?.provider === "google") {
        token.isGoogle = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { plan?: string }).plan = token.plan as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { isGoogle?: boolean }).isGoogle = token.isGoogle as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After Google OAuth, go to WP sync endpoint
      if (url.includes("/api/auth/callback/google")) {
        return `${baseUrl}/api/auth/google-wp-sync`;
      }
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
});
