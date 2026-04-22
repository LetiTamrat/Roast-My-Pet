import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GalleryGrid } from "./gallery-grid";
import { ARCHETYPES } from "@/lib/archetypes";

export const metadata: Metadata = {
  title: "Public roast gallery",
  description: "Browse the best AI-generated pet roasts. Updated live.",
};

interface PageProps {
  searchParams: Promise<{ archetype?: string; level?: string }>;
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const archetype = sp.archetype;
  const level = sp.level;

  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-24 pt-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">The roast gallery</h1>
            <p className="mt-3 text-muted-foreground">
              The finest pets the internet has ever been this honest about.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <FilterBar activeArchetype={archetype} activeLevel={level} />
          </div>

          <div className="mt-8">
            <GalleryGrid archetype={archetype} level={level} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function FilterBar({
  activeArchetype,
  activeLevel,
}: {
  activeArchetype?: string;
  activeLevel?: string;
}) {
  const mkHref = (key: "archetype" | "level", value?: string) => {
    const params = new URLSearchParams();
    if (key === "archetype") {
      if (value) params.set("archetype", value);
      if (activeLevel) params.set("level", activeLevel);
    } else {
      if (activeArchetype) params.set("archetype", activeArchetype);
      if (value) params.set("level", value);
    }
    return `/gallery${params.size ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="text-muted-foreground">Archetype:</span>
        <a
          href={mkHref("archetype", undefined)}
          className={`rounded-full border px-3 py-1 ${!activeArchetype ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}
        >
          All
        </a>
        {ARCHETYPES.slice(0, 12).map((a) => {
          const active = activeArchetype === a.name;
          return (
            <a
              key={a.name}
              href={mkHref("archetype", a.name)}
              className={`rounded-full border px-3 py-1 ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}
            >
              {a.emoji} {a.name}
            </a>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="text-muted-foreground">Level:</span>
        {[
          { value: "", label: "All" },
          { value: "cute", label: "Cute" },
          { value: "medium", label: "Medium" },
          { value: "savage", label: "Savage" },
        ].map((l) => {
          const active = (activeLevel || "") === l.value;
          return (
            <a
              key={l.value || "all"}
              href={mkHref("level", l.value || undefined)}
              className={`rounded-full border px-3 py-1 ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}
            >
              {l.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
