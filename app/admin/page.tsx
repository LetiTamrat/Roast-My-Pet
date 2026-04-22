import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { supabaseService } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

async function flagAction(formData: FormData) {
  "use server";
  const admin = await getAdminSession();
  if (!admin) return;
  const id = String(formData.get("id"));
  const action = String(formData.get("action"));
  const sb = supabaseService();
  if (action === "remove") {
    await sb.from("roasts").update({ is_flagged: true, is_public: false }).eq("id", id);
    await sb.from("flags").update({ status: "removed" }).eq("roast_id", id);
  } else {
    await sb.from("flags").update({ status: "dismissed" }).eq("roast_id", id);
  }
  redirect("/admin");
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.profile?.role !== "admin") notFound();

  const sb = supabaseService();
  const { data: flags } = await sb
    .from("flags")
    .select("*, roast:roasts(id, short_id, pet_name, roast_text, archetype, archetype_emoji, source_image_url)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <Header />
      <main className="px-4 pb-24 pt-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold">Moderation queue</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {flags?.length || 0} pending report{(flags?.length || 0) === 1 ? "" : "s"}.
          </p>
          <div className="mt-8 space-y-4">
            {(flags || []).map((f: any) => (
              <div
                key={f.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-start gap-4">
                  {f.roast?.source_image_url && (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image src={f.roast.source_image_url} alt="" fill sizes="96px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">
                      {f.roast?.archetype_emoji} {f.roast?.pet_name}
                    </div>
                    <p className="mt-1 text-sm">{f.roast?.roast_text}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Reason: {f.reason || "(no reason)"}
                    </div>
                    <Link
                      href={`/r/${f.roast?.short_id}`}
                      className="mt-2 inline-block text-xs underline text-primary"
                    >
                      View
                    </Link>
                  </div>
                </div>
                <form action={flagAction} className="mt-4 flex gap-2">
                  <input type="hidden" name="id" value={f.roast_id} />
                  <Button type="submit" name="action" value="dismiss" variant="outline" size="sm">
                    Dismiss
                  </Button>
                  <Button type="submit" name="action" value="remove" variant="destructive" size="sm">
                    Remove
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
