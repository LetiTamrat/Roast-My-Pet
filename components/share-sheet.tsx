"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Instagram, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Channel =
  | "instagram"
  | "tiktok"
  | "x"
  | "whatsapp"
  | "facebook"
  | "copy_link"
  | "download"
  | "download_story"
  | "native";

interface Props {
  shortId: string;
  shareUrl: string;
  squareUrl: string;
  storyUrl: string;
  roastText: string;
}

function logShare(shortId: string, channel: Channel) {
  track("share_clicked", { channel, shortId });
  fetch(`/api/roast/${shortId}/share`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ channel }),
    keepalive: true,
  }).catch(() => {});
}

async function tryNativeShare(url: string, text: string, file?: File) {
  if (typeof navigator === "undefined" || !("share" in navigator)) return false;
  try {
    const data: ShareData = { url, text, title: "Roast My Pet" };
    if (file && "canShare" in navigator && (navigator as Navigator).canShare?.({ files: [file] })) {
      data.files = [file];
    }
    await navigator.share(data);
    return true;
  } catch {
    return false;
  }
}

async function imageFile(url: string, filename: string): Promise<File | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || "image/png" });
  } catch {
    return null;
  }
}

export function ShareSheet({ shortId, shareUrl, squareUrl, storyUrl, roastText }: Props) {
  const [busy, setBusy] = useState<Channel | null>(null);

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${roastText}\n\n`
  )}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${roastText}\n${shareUrl}`)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const onNative = async () => {
    setBusy("native");
    const file = await imageFile(squareUrl, `roast-${shortId}.png`);
    const ok = await tryNativeShare(shareUrl, roastText, file ?? undefined);
    setBusy(null);
    if (ok) logShare(shortId, "native");
    else toast("Sharing isn't available here — try a specific app below.");
  };

  const onDownload = async (url: string, name: string, channel: Channel) => {
    setBusy(channel);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
      track("download_clicked", { shortId, kind: channel });
      logShare(shortId, channel);
    } catch {
      toast.error("Download failed. Try long-pressing the image.");
    } finally {
      setBusy(null);
    }
  };

  const onInstagram = async () => {
    setBusy("instagram");
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    if (isMobile) {
      window.location.href = "instagram://story-camera";
      setTimeout(() => {
        onDownload(storyUrl, `roast-${shortId}-story.png`, "instagram");
      }, 600);
    } else {
      await onDownload(storyUrl, `roast-${shortId}-story.png`, "instagram");
      toast("Image downloaded — upload it to your Instagram Story!");
    }
    setBusy(null);
  };

  const onTikTok = async () => {
    setBusy("tiktok");
    await onDownload(squareUrl, `roast-${shortId}.png`, "tiktok");
    toast("Image saved — open TikTok and post it!");
    setBusy(null);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
      logShare(shortId, "copy_link");
    } catch {
      toast.error("Could not copy. Select and copy manually.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant="outline" onClick={onNative} disabled={busy === "native"}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
        <Button variant="outline" onClick={onInstagram} disabled={busy === "instagram"}>
          <Instagram className="h-4 w-4" /> Instagram
        </Button>
        <Button variant="outline" onClick={onTikTok} disabled={busy === "tiktok"}>
          <span className="text-base">🎵</span> TikTok
        </Button>
        <Button variant="outline" asChild>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => logShare(shortId, "x")}
          >
            <span className="text-base font-bold">𝕏</span> Post on X
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => logShare(shortId, "whatsapp")}
          >
            <span className="text-base">💬</span> WhatsApp
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href={fbUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => logShare(shortId, "facebook")}
          >
            <span className="text-base">📘</span> Facebook
          </a>
        </Button>
        <Button variant="outline" onClick={onCopy}>
          <Copy className="h-4 w-4" /> Copy link
        </Button>
        <Button
          variant="outline"
          onClick={() => onDownload(squareUrl, `roast-${shortId}.png`, "download")}
          disabled={busy === "download"}
        >
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDownload(storyUrl, `roast-${shortId}-story.png`, "download_story")}
        className="w-full"
      >
        <Download className="h-3.5 w-3.5" /> Download Story (1080×1920)
      </Button>
    </div>
  );
}
