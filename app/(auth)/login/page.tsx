import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to Roast My Pet to manage your roasts.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl">🔥</div>
        <h1 className="mt-4 font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick up where you left off. Your pets haven't moved.
        </p>
      </div>
      <AuthForm mode="login" next={sp.next || "/my-roasts"} initialError={sp.error} />
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href={`/signup${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`}
          className="font-semibold text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
