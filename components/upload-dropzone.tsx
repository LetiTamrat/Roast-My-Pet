"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, ImagePlus, Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFile: (file: File, previewUrl: string) => void;
  busy?: boolean;
  preview?: string | null;
}

export function UploadDropzone({ onFile, busy, preview }: Props) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setError(null);
      const file = accepted[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be under 10 MB.");
        return;
      }
      const url = URL.createObjectURL(file);
      onFile(file, url);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
    },
    maxFiles: 1,
    multiple: false,
    noClick: !!preview,
    noKeyboard: !!preview,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/50 p-6 text-center transition-all focus-within:border-primary",
          isDragActive && "border-primary bg-primary/10",
          preview && "cursor-default border-solid"
        )}
      >
        <input {...getInputProps()} aria-label="Upload pet photo" />
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Pet preview"
              className="h-56 w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-background shadow hover:opacity-90"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Replace
            </button>
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImagePlus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Drop your pet's photo here
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or tap to browse · JPG, PNG, WEBP, HEIC · up to 10MB
              </p>
            </div>
            <button
              type="button"
              className="mt-1 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm hover:border-primary/50"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              <Camera className="h-3.5 w-3.5" />
              Choose photo
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
