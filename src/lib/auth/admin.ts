import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

/** Server-side guard to use at the top of admin server actions and routes. Middleware also enforces this, but defense-in-depth. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/dashboard");
  return session;
}
