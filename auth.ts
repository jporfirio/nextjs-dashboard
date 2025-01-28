import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@vercel/postgres";
import { User } from "@/app/lib/definitions";
import bcrypt from "bcrypt";

async function getUser(email: string): Promise<User | null> {
  try {
    const client = await db.connect();
    const users =
      await client.sql<User>`SELECT  * FROM users WHERE email=${email}`;
    return users.rows[0] ?? null;
  } catch {
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        console.log(credentials, parsedCredentials.data);
        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const user = await getUser(email);

        console.log(user);
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          console.log(passwordMatch);
          return user;
        }

        return null;
      },
    }),
  ],
});
