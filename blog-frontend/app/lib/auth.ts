import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// TypeScript uchun session va user tiplarini kengaytiramiz
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
  }
}

// Token uchun ham tip kengaytirish (JWT callback uchun muhim)
// Note: next-auth v5 beta may not expose `next-auth/jwt` for module augmentation.
// If you need to augment the JWT type, install appropriate types or
// adjust declarations per the auth package version. For now we avoid
// augmenting `next-auth/jwt` to prevent build-time module resolution errors.

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Django Backend",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/`, {
            method: "POST",
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          // Django JWT odatda 'access' va 'refresh' kalitlarini qaytaradi
          if (res.ok && data.access) {
            return {
              id: "1", // Ideal holda Django ID qaytarishi kerak
              name: credentials.username as string,
              accessToken: data.access,
              refreshToken: data.refresh,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  session: { 
    strategy: "jwt",
    maxAge: 60 * 60, // 1 soat
  },
  callbacks: {
    // 1. JWT yaratish
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    // 2. Session yaratish
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  // .env.local faylida AUTH_SECRET=... bo'lishi shart
  secret: process.env.AUTH_SECRET,
});
