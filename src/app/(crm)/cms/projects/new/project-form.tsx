"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsTagInput } from "@/components/cms/cms-tag-input";
import { CmsGalleryEditor } from "@/components/cms/cms-gallery-editor";
import { CmsMediaPicker } from "@/components/cms/cms-media-picker";
import { createProjectAction } from "@/app/actions/cms/projects";

export function ProjectForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await createProjectAction(new FormData(e.currentTarget));
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (otomatis dari title)</Label>
        <Input id="slug" name="slug" placeholder="auto-generated" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" required rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" placeholder="e.g. Packaging Food Grade" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Input id="client" name="client" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
        </div>
        <CmsMediaPicker name="imageId" label="Main Image" />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <CmsTagInput name="tags" />
      </div>

      <div className="space-y-2">
        <Label>Gallery</Label>
        <CmsGalleryEditor name="gallery" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPublished" name="isPublished" defaultChecked />
        <Label htmlFor="isPublished">Published</Label>
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
