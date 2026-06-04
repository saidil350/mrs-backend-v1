"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CmsMedia } from "@/types";
import { updateMediaAction } from "@/app/actions/cms/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EditMediaForm({ media }: { media: CmsMedia }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      await updateMediaAction(formData);
      router.push("/cms/media");
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={media.id} />

      {/* Preview */}
      {media.mimeType.startsWith("image/") && (
        <div className="rounded-lg overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.url} alt={media.alt} className="max-h-64 mx-auto" />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="alt">Alt Text</Label>
        <Input
          id="alt"
          name="alt"
          defaultValue={media.alt}
          placeholder="Deskripsi gambar..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          name="caption"
          defaultValue={media.caption ?? ""}
          placeholder="Caption..."
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
