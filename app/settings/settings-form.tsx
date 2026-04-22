"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/auth/session";

interface Props {
  email: string | null;
  profile: Profile;
}

export function SettingsForm({ email, profile }: Props) {
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          display_name: displayName.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Could not save.");
      }
      toast.success("Saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  const onPickAvatar = () => fileInput.current?.click();

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const compressed = await imageCompression(f, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      const signed = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentType: "image/jpeg" }),
      }).then((r) => r.json());
      if (!signed?.uploadUrl) throw new Error(signed?.message || "Could not get upload URL.");

      const put = await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: { "content-type": "image/jpeg" },
        body: compressed,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);

      setAvatarUrl(signed.publicUrl);
      toast.success("Avatar updated — don't forget to save.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      <section className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <Label>Avatar</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="avatar" fill sizes="80px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">🐾</div>
            )}
          </div>
          <div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden"
              aria-label="Upload avatar"
            />
            <Button type="button" variant="outline" onClick={onPickAvatar} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Change avatar"}
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">JPG or PNG. Resized to 512×512.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="space-y-1.5">
          <Label htmlFor="username">Username (handle)</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={24}
            placeholder="mochi_cat"
          />
          <p className="text-xs text-muted-foreground">
            3–24 chars: lowercase letters, numbers, underscores. Shown at{" "}
            <span className="font-mono">/{username || "your_handle"}</span>.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            className="flex w-full rounded-xl border border-border bg-card px-4 py-2 text-base text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:border-primary"
            placeholder="Pet parent. Roast enthusiast."
          />
          <p className="text-xs text-muted-foreground text-right">{bio.length}/280</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="text-sm">
          <div className="font-semibold">Email</div>
          <div className="text-muted-foreground">{email || "—"}</div>
        </div>
      </section>

      <Button type="submit" disabled={busy} className="w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
