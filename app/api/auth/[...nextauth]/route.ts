import NextAuth from "next-auth";
import { createAuthOptions } from "@/lib/authConfig";

// Create a dynamic handler that uses the async auth options
const handler = async (req: any, res: any) => {
  const authOptions = await createAuthOptions();
  return NextAuth(authOptions)(req, res);
};

export { handler as GET, handler as POST };