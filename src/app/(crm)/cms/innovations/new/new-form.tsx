"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInnovationAction } from "@/app/actions/cms/innovations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsMediaPicker } from "@/components/cms/cms-media-picker";

export function NewInnovationForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      // Parse comma-separated tags into JSON string
      const tagsInput = (document.getElementById("tagsText") as HTMLInputElement)?.value || "";
      const tags = tagsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      formData.set("tags", JSON.stringify(tags));
      await createInnovationAction(formData);
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          name="title"
          placeholder="Judul inovasi"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Deskripsi inovasi..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Input id="icon" name="icon" placeholder="Nama icon (mis. Lightbulb)" />
      </div>

      <CmsMediaPicker name="imageId" label="Image" />

      <div className="space-y-2">
        <Label htmlFor="tagsText">Tags (pisahkan dengan koma)</Label>
        <Input
          id="tagsText"
          name="tagsText"
          placeholder="Teknologi, Sustainability, R&D"
        />
        <p className="text-xs text-muted-foreground">
          Pisahkan dengan koma. Contoh: Teknologi, Sustainability
        </p>
      </div>

      <input type="hidden" name="tags" value="[]" />

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Urutan</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={0}
          min={0}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          name="isPublished"
          className="size-4 rounded border-input"
        />
        <Label htmlFor="isPublished">Publish</Label>
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
