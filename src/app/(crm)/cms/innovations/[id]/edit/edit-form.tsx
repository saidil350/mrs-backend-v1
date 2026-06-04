"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Innovation } from "@/types";
import { updateInnovationAction } from "@/app/actions/cms/innovations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsMediaPicker } from "@/components/cms/cms-media-picker";

export function EditInnovationForm({ innovation }: { innovation: Innovation }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tagsText, setTagsText] = useState(innovation.tags.join(", "));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Convert comma-separated tags text to JSON array
      const tags = tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      formData.set("tags", JSON.stringify(tags));

      await updateInnovationAction(formData);
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={innovation.id} />

      <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          name="title"
          defaultValue={innovation.title}
          placeholder="Judul inovasi"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={innovation.description}
          placeholder="Deskripsi inovasi..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Input
          id="icon"
          name="icon"
          defaultValue={innovation.icon ?? ""}
          placeholder="Nama icon (mis. Lightbulb)"
        />
      </div>

      <CmsMediaPicker name="imageId" label="Image" defaultValue={innovation.imageId} />

      <div className="space-y-2">
        <Label htmlFor="tagsText">Tags (pisahkan dengan koma)</Label>
        <Input
          id="tagsText"
          name="tagsText"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="Teknologi, Sustainability, R&D"
        />
        <p className="text-xs text-muted-foreground">
          Pisahkan dengan koma. Contoh: Teknologi, Sustainability
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Urutan</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={innovation.sortOrder}
          min={0}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          name="isPublished"
          defaultChecked={innovation.isPublished}
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
