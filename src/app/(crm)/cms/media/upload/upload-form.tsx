"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadMediaAction } from "@/app/actions/cms/media";

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await uploadMediaAction(formData);
      if (result) {
        router.push("/cms/media");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 rounded-md"
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full size-6 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                setFileName("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {fileName || "Klik atau drag file ke sini"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP, SVG, GIF, PDF (max 10MB)
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,application/pdf"
          className="hidden"
          required
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alt">Alt Text</Label>
        <Input id="alt" name="alt" placeholder="Deskripsi gambar..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption">Caption (opsional)</Label>
        <Textarea
          id="caption"
          name="caption"
          placeholder="Caption..."
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </form>
  );
}
