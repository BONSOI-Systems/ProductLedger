import type { NextAuthOptions, User as NextAuthUser, Session as NextAuthSession, DefaultSession } from "next-auth/"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare, hash } from "bcryptjs"
import { connectToDatabase, collections } from "@/lib/db"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    companyName: string
  }

  interface Session {
    user: {
      id: string
      role: string
      companyName: string
      name?: string | null
      email?: string | null
      image?: string | null
    } & DefaultSession["user"]
  }

  interface JWT {
    id: string
    role: string
    companyName: string
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { db } = await connectToDatabase();
        const user = await db.collection(collections.users).findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          role: user.role,
          companyName: user.companyName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if (user) {
          token.role = (user as any).role || "";
          token.companyName = (user as any).companyName || "";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          role: token.role,
          companyName: token.companyName,
          name: session.user?.name || null,
          email: session.user?.email || null,
          image: session.user?.image || null,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
  companyName: string
}) {
  const { db } = await connectToDatabase()

  // Check if user already exists
  const existingUser = await db.collection(collections.users).findOne({ email: userData.email.toLowerCase() })
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password
  const hashedPassword = await hash(userData.password, 12)

  // Create user
  const result = await db.collection(collections.users).insertOne({
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    companyName: userData.companyName,
    role: "admin", // First user is admin
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return {
    id: result.insertedId.toString(),
    name: userData.name,
    email: userData.email,
    companyName: userData.companyName,
  }
}

export async function generatePasswordResetToken(email: string) {
  const { db } = await connectToDatabase()

  // Check if user exists
  const user = await db.collection(collections.users).findOne({ email: email.toLowerCase() })
  if (!user) {
    throw new Error("User not found")
  }

  // Generate token
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 3600000) // 1 hour

  // Store token
  await db.collection(collections.passwordResets).insertOne({
    userId: user._id,
    token,
    expires,
    createdAt: new Date(),
  })

  return { token, email: user.email }
}

export async function resetPassword(token: string, newPassword: string) {
  const { db } = await connectToDatabase()

  // Find token
  const resetRequest = await db.collection(collections.passwordResets).findOne({
    token,
    expires: { $gt: new Date() },
  })

  if (!resetRequest) {
    throw new Error("Invalid or expired token")
  }

  // Hash new password
  const hashedPassword = await hash(newPassword, 12)

  // Update user password
  await db.collection(collections.users).updateOne(
    { _id: resetRequest.userId },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    },
  )

  // Delete token
  await db.collection(collections.passwordResets).deleteOne({ _id: resetRequest._id })

  return true
}
