"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dices, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface Props {
  shortId: string;
  initialIsPublic: boolean;
  petName: string;
  petType: string | null;
  traits: string[];
  level: string;
  style: string;
  ownedByCurrentUser?: boolean;
}

export function ResultClient({
  shortId,
  initialIsPublic,
  ownedByCurrentUser = false,
}: Props) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [ownerToken, setOwnerToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      setOwnerToken(localStorage.getItem(`roast:owner:${shortId}`));
    } catch {}
    track("roast_viewed", { shortId });
  }, [shortId]);

  const canManage = ownedByCurrentUser || !!ownerToken;

  if (!canManage) return null;

  const togglePublic = async (next: boolean) => {
    setIsPublic(next);
    const res = await fetch(`/api/roast/${shortId}/public`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_public: next, owner_token: ownerToken || undefined }),
    });
    if (!res.ok) {
      setIsPublic(!next);
      const err = await res.json().catch(() => ({}));
      toast.error(err.message || "Could not update visibility.");
      return;
    }
    track("made_public", { shortId, value: next });
    toast.success(next ? "Now visible in the public gallery!" : "Back to private.");
  };

  const regenerate = async () => {
    setRegenerating(true);
    track("regenerate_clicked", { shortId });
    try {
      const res = await fetch(`/api/roast/${shortId}/regenerate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ owner_token: ownerToken || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Could not regenerate.");
      }
      toast.success("Fresh roast coming right up.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Regeneration failed.");
    } finally {
      setRegenerating(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/roast/${shortId}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ owner_token: ownerToken || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Could not delete.");
      }
      try {
        localStorage.removeItem(`roast:owner:${shortId}`);
      } catch {}
      toast.success("Roast deleted.");
      router.push(ownedByCurrentUser ? "/my-roasts" : "/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
      setDeleting(false);
    }
  };

  return (
    <>
      <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">You own this roast</h2>
            <p className="text-xs text-muted-foreground">
              Manage visibility, re-roll, or delete it forever.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            Owner
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              {isPublic ? (
                <>
                  <Eye className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-semibold">Public</div>
                    <div className="text-xs text-muted-foreground">
                      Visible in the gallery and on your profile.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">Private</div>
                    <div className="text-xs text-muted-foreground">
                      Only you can see it with this link.
                    </div>
                  </div>
                </>
              )}
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={togglePublic}
              aria-label="Toggle public visibility"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={regenerate}
              disabled={regenerating || deleting}
              className="w-full"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Dices className="h-4 w-4" />
              )}
              {regenerating ? "Regenerating..." : "Roast again 🎲"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(true)}
              disabled={regenerating || deleting}
              className={cn(
                "w-full border-destructive/30 text-destructive",
                "hover:bg-destructive/10 hover:border-destructive/60"
              )}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(false)}>
        <DialogContent>
          <DialogTitle className="font-display text-xl font-bold">
            Delete this roast?
          </DialogTitle>
          <DialogDescription className="mt-2 text-muted-foreground">
            The roast, meme images, reactions, and share link all go away. This
            can't be undone.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Keep it
            </Button>
            <Button variant="destructive" onClick={doDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete forever
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
