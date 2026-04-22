"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UploadDropzone } from "@/components/upload-dropzone";
import { TraitChip } from "@/components/trait-chip";
import { RoastLevelSlider } from "@/components/roast-level-slider";
import { LoadingScene } from "@/components/loading-scene";
import { TRAITS, ROAST_STYLES, PET_TYPES } from "@/lib/traits";
import { track } from "@/lib/analytics";

const MAX_TRAITS = 5;

const schema = z.object({
  pet_name: z.string().trim().min(1, "Pet name is required.").max(30, "Max 30 characters."),
  pet_type: z.string().optional().nullable(),
  traits: z.array(z.string()).max(MAX_TRAITS).default([]),
  roast_level: z.enum(["cute", "medium", "savage"]),
  roast_style: z.enum([
    "default",
    "standup",
    "shakespearean",
    "genz",
    "corporate",
    "pirate",
    "rap",
  ]),
});

type FormValues = z.infer<typeof schema>;

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pet_name: "",
      pet_type: "",
      traits: [],
      roast_level: "medium",
      roast_style: "default",
    },
  });

  const traits = watch("traits") || [];
  const petName = watch("pet_name");

  useEffect(() => {
    track("upload_started");
  }, []);

  const onFile = async (f: File, previewUrl: string) => {
    setBusy(true);
    setPreview(previewUrl);
    try {
      const compressed = await imageCompression(f, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      setFile(compressed);
    } catch {
      setFile(f);
    }
    setBusy(false);
  };

  const toggleTrait = (t: string) => {
    const has = traits.includes(t);
    if (has) {
      setValue(
        "traits",
        traits.filter((x) => x !== t),
        { shouldValidate: true }
      );
    } else if (traits.length < MAX_TRAITS) {
      setValue("traits", [...traits, t], { shouldValidate: true });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!file) {
      toast.error("Upload a photo of your pet first.");
      return;
    }
    setLoading(true);
    try {
      const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          filename: `pet.${ext}`,
          contentType: file.type || "image/jpeg",
        }),
      });
      if (!urlRes.ok) {
        const e = await urlRes.json().catch(() => ({}));
        throw new Error(e.message || "Could not start upload.");
      }
      const { uploadUrl, publicUrl, path, token } = await urlRes.json();

      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "content-type": file.type || "image/jpeg",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);

      track("upload_completed");

      const roastRes = await fetch("/api/roast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image_url: publicUrl,
          image_path: path,
          pet_name: values.pet_name,
          pet_type:
            values.pet_type && values.pet_type !== "__auto" ? values.pet_type : null,
          traits: values.traits,
          roast_level: values.roast_level,
          roast_style: values.roast_style,
        }),
      });

      if (!roastRes.ok) {
        const err = await roastRes.json().catch(() => ({}));
        throw new Error(err.message || "Roast generation failed.");
      }
      const data = await roastRes.json();
      if (data?.owner_token) {
        try {
          localStorage.setItem(`roast:owner:${data.short_id}`, data.owner_token);
        } catch {}
      }
      track("roast_generated", { shortId: data.short_id, level: values.roast_level });
      router.push(`/r/${data.short_id}`);
    } catch (err) {
      track("roast_failed", { message: err instanceof Error ? err.message : "unknown" });
      toast.error(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  });

  const submitDisabled = !file || !petName?.trim() || busy || loading;

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        <section className="space-y-2">
          <Label>Photo</Label>
          <UploadDropzone onFile={onFile} busy={busy} preview={preview} />
        </section>

        <section className="space-y-2">
          <Label htmlFor="pet_name">Pet name *</Label>
          <Input
            id="pet_name"
            placeholder="Tofu, Bruno, Princess Whiskerton III..."
            maxLength={30}
            {...register("pet_name")}
          />
          {errors.pet_name && (
            <p className="text-xs text-destructive">{errors.pet_name.message}</p>
          )}
        </section>

        <section className="space-y-2">
          <Label htmlFor="pet_type">Pet type</Label>
          <Controller
            name="pet_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ""} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger id="pet_type">
                  <SelectValue placeholder="Let AI guess" />
                </SelectTrigger>
                <SelectContent>
                  {PET_TYPES.map((t) => (
                    <SelectItem key={t.value || "auto"} value={t.value || "__auto"}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Personality traits</Label>
            <span className="text-xs text-muted-foreground">
              {traits.length} / {MAX_TRAITS} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRAITS.map((t) => (
              <TraitChip
                key={t}
                label={t}
                selected={traits.includes(t)}
                onToggle={() => toggleTrait(t)}
                disabled={traits.length >= MAX_TRAITS}
              />
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <Label>Roast level</Label>
          <Controller
            name="roast_level"
            control={control}
            render={({ field }) => (
              <RoastLevelSlider value={field.value} onChange={field.onChange} />
            )}
          />
        </section>

        <section className="space-y-2">
          <Label htmlFor="roast_style">Roast style</Label>
          <Controller
            name="roast_style"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="roast_style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROAST_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </section>

        <Button
          type="submit"
          size="xl"
          className="w-full"
          disabled={submitDisabled}
        >
          {loading ? "Roasting..." : "Roast My Pet 🔥"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <a href="/terms" className="underline">Terms</a> and{" "}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </form>
      <AnimatePresence>{loading && <LoadingScene />}</AnimatePresence>
    </>
  );
}
