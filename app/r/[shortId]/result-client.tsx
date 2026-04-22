"use client";

import { useEffect, useState } from "react";
import { Dices } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { useRouter } from "next/navigation";

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
  const [ownerToken, setOwnerToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      setOwnerToken(localStorage.getItem(`roast:owner:${shortId}`));
    } catch {}
    track("roast_viewed", { shortId });
  }, [shortId]);

  const canManage = ownedByCurrentUser || !!ownerToken;

  const togglePublic = async (next: boolean) => {
    setIsPublic(next);
    if (!canManage) {
      toast("Log in or open this on the device you made it on to change visibility.");
      setIsPublic(!next);
      return;
    }
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
    if (!canManage) {
      toast("Only the creator can regenerate this roast.");
      return;
    }
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

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div>
          <div className="text-sm font-semibold">Share to public gallery?</div>
          <div className="text-xs text-muted-foreground">
            Anyone can find your pet's roast. No identifying info shared.
          </div>
        </div>
        <Switch checked={isPublic} onCheckedChange={togglePublic} aria-label="Make public" />
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={regenerate}
        disabled={regenerating}
        className="w-full"
      >
        <Dices className="h-4 w-4" />
        {regenerating ? "Regenerating..." : "Roast again 🎲"}
      </Button>
    </div>
  );
}
