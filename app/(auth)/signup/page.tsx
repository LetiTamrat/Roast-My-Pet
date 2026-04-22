import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Roast My Pet account to save and manage your roasts.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl">🎉</div>
        <h1 className="mt-4 font-display text-3xl font-bold">Join the pack</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign up to save roasts, manage what's public, and get a profile at{" "}
          <span className="font-mono">roastmypet.com/yourhandle</span>.
        </p>
      </div>
      <AuthForm mode="signup" next={sp.next || "/my-roasts"} initialError={sp.error} />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`}
          className="font-semibold text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
