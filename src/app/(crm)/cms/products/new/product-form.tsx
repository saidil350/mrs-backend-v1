"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsRichEditor } from "@/components/cms/cms-rich-editor";
import { CmsGalleryEditor } from "@/components/cms/cms-gallery-editor";
import { CmsSpecEditor } from "@/components/cms/cms-spec-editor";
import { CmsSeoFields } from "@/components/cms/cms-seo-fields";
import { createProductAction } from "@/app/actions/cms/products";

export function ProductForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await createProductAction(new FormData(e.currentTarget));
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (otomatis)</Label>
          <Input id="slug" name="slug" placeholder="auto-generated" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea id="excerpt" name="excerpt" required rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <CmsRichEditor name="description" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category ID</Label>
          <Input id="categoryId" name="categoryId" placeholder="UUID dari Product Categories" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricingInfo">Pricing Info</Label>
          <Input id="pricingInfo" name="pricingInfo" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gallery</Label>
        <CmsGalleryEditor name="gallery" />
      </div>

      <div className="space-y-2">
        <Label>Specifications</Label>
        <CmsSpecEditor name="specifications" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue="100" />
        </div>
        <div className="flex items-center gap-4 pt-6">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" name="featured" />
            <Label htmlFor="featured">Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPublished" name="isPublished" />
            <Label htmlFor="isPublished">Published</Label>
          </div>
        </div>
      </div>

      <CmsSeoFields />

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
