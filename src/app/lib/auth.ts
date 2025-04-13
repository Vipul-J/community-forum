import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    }), 
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile, email }) {
      if (account?.provider === 'credentials') {
        return true;
      }
    
      if (account?.provider === 'github' && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string },
            include: { accounts: true }
          });
    
          if (existingUser) {
            const isThisGithubLinked = existingUser.accounts.some(
              acc => acc.provider === 'github' && 
                    acc.providerAccountId === account.providerAccountId
            );
    
            if (isThisGithubLinked) {
              return true;
            }
    
            const hasDifferentGithubLinked = existingUser.accounts.some(
              acc => acc.provider === 'github' && 
                    acc.providerAccountId !== account.providerAccountId
            );
    
            if (hasDifferentGithubLinked) {
              return '/login?error=DifferentGithubLinked';
            }
    
            try {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
              return true;
            } catch (error) {
              console.error("Failed to link GitHub account:", error);
              return '/login?error=LinkingFailed';
            }
          }
        } catch (error) {
          console.error("Error in sign-in callback:", error);
          return '/login?error=DatabaseError';
        }
      }
      
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};