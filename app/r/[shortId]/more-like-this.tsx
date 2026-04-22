import Image from "next/image";
import Link from "next/link";
import { supabaseService } from "@/lib/supabase/server";

interface Props {
  archetype: string;
  excludeShortId: string;
}

export async function MoreLikeThis({ archetype, excludeShortId }: Props) {
  let data: any[] | null = null;
  let byRoast = new Map<string, string>();
  try {
    const sb = supabaseService();
    const res = await sb
      .from("roasts")
      .select("id, short_id, pet_name, archetype, archetype_emoji")
      .eq("archetype", archetype)
      .eq("is_public", true)
      .eq("is_flagged", false)
      .neq("short_id", excludeShortId)
      .order("created_at", { ascending: false })
      .limit(6);
    data = res.data;
    if (data?.length) {
      const ids = data.map((r) => r.id);
      const { data: assets } = await sb
        .from("meme_assets")
        .select("roast_id, url, format")
        .in("roast_id", ids)
        .eq("format", "square");
      for (const a of assets || []) byRoast.set(a.roast_id, a.url);
    }
  } catch {
    return null;
  }

  if (!data?.length) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-bold">
        More {archetype.toLowerCase()}s in the wild
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.map((r) => {
          const url = byRoast.get(r.id);
          if (!url) return null;
          return (
            <Link
              key={r.id}
              href={`/r/${r.short_id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-transform hover:scale-[1.02]"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={url}
                  alt={`${r.pet_name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold">
                <span aria-hidden>{r.archetype_emoji}</span>
                <span className="truncate">{r.pet_name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
