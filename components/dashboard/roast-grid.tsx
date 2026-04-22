"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreVertical, Trash2, ExternalLink, Eye, EyeOff, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface DashboardItem {
  id: string;
  short_id: string;
  pet_name: string;
  archetype: string;
  archetype_emoji: string;
  roast_text: string;
  is_public: boolean;
  thumb_url: string;
  created_at: string;
}

interface Props {
  initialItems: DashboardItem[];
}

export function RoastGrid({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [deleting, setDeleting] = useState<DashboardItem | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const setPublic = async (item: DashboardItem, next: boolean) => {
    setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, is_public: next } : x)));
    const res = await fetch(`/api/roast/${item.short_id}/public`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_public: next }),
    });
    if (!res.ok) {
      setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, is_public: !next } : x)));
      toast.error("Couldn't update visibility.");
    } else {
      toast.success(next ? "Now public in the gallery." : "Set to private.");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      const res = await fetch(`/api/roast/${deleting.short_id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Could not delete.");
      }
      setItems((xs) => xs.filter((x) => x.id !== deleting.id));
      setDeleting(null);
      toast.success("Roast deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
          >
            <Link href={`/r/${item.short_id}`} className="block">
              <div className="relative aspect-square w-full bg-muted">
                {item.thumb_url && (
                  <Image
                    src={item.thumb_url}
                    alt={item.pet_name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                )}
              </div>
            </Link>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <span aria-hidden>{item.archetype_emoji}</span>
                    <span className="truncate">{item.archetype}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold">{item.pet_name}</p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    aria-label="More actions"
                    onClick={() => setMenuFor((v) => (v === item.id ? null : item.id))}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuFor === item.id && (
                    <div
                      className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-card"
                      onMouseLeave={() => setMenuFor(null)}
                    >
                      <Link
                        href={`/r/${item.short_id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </Link>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/r/${item.short_id}`
                          );
                          toast.success("Link copied!");
                          setMenuFor(null);
                        }}
                      >
                        <Share2 className="h-3.5 w-3.5" /> Copy link
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setDeleting(item);
                          setMenuFor(null);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {item.is_public ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-primary" /> Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> Private
                    </>
                  )}
                </div>
                <Switch
                  checked={item.is_public}
                  onCheckedChange={(v) => setPublic(item, v)}
                  aria-label="Toggle public"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogTitle className="font-display text-xl font-bold">Delete this roast?</DialogTitle>
          <DialogDescription className="mt-2 text-muted-foreground">
            The roast, meme images, and share link are all removed. This can't be undone.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={deletingBusy}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deletingBusy}>
              {deletingBusy && <Loader2 className={cn("h-4 w-4 animate-spin")} />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
