// src/lib/auth.config.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [DiscordProvider({
          clientId: process.env.DISCORD_CLIENT_ID!,
          clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        })]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }, // <<< importante
};
