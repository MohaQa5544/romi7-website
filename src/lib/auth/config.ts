import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import "next-auth/jwt";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "student" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: "student" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "student" | "admin";
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = (
          await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()))
        )[0];

        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // touch last active
        await db
          .update(schema.users)
          .set({ lastActiveAt: new Date() })
          .where(eq(schema.users.id, user.id));

        // Log login event (fire-and-forget)
        db.insert(schema.activityLog)
          .values({ userId: user.id, eventType: "login" })
          .catch(() => {});

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatarUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "admin";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const protectedPrefixes = [
        "/dashboard",
        "/semester",
        "/unit",
        "/quiz",
        "/bookmarks",
        "/history",
        "/announcements",
        "/profile",
      ];
      const isStudentRoute = protectedPrefixes.some((p) => nextUrl.pathname.startsWith(p));
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");

      if (isAdminRoute) return isLoggedIn && role === "admin";
      if (isStudentRoute) return isLoggedIn;
      if (isAuthPage && isLoggedIn) {
        const dest = role === "admin" ? "/admin" : "/dashboard";
        return Response.redirect(new URL(dest, nextUrl));
      }
      return true;
    },
  },
  trustHost: true,
});
