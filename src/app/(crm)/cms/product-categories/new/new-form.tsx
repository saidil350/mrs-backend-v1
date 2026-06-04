"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductCategoryAction } from "@/app/actions/cms/product-categories";
import { generateSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewProductCategoryForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugManuallyEdited) {
      const slugInput = document.getElementById("slug") as HTMLInputElement;
      if (slugInput) {
        slugInput.value = generateSlug(e.target.value);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createProductCategoryAction(formData);
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          name="name"
          placeholder="Nama kategori"
          required
          onChange={handleNameChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="slug-kategori"
          onChange={() => setSlugManuallyEdited(true)}
        />
        <p className="text-xs text-muted-foreground">
          Otomatis dibuat dari nama. Kosongkan untuk auto-generate.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Deskripsi kategori..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Input id="icon" name="icon" placeholder="Nama icon (mis. Package)" />
      </div>

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
