import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SettingsForm } from "./settings-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/settings");
  if (!session.profile) redirect("/login");

  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-24 pt-8 sm:px-6">
        <div className="mx-auto max-w-xl">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your public profile lives at{" "}
            <span className="font-mono">/{session.profile.username}</span>.
          </p>
          <div className="mt-8">
            <SettingsForm
              email={session.email}
              profile={session.profile}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
