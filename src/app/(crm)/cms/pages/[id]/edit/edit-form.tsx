"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CmsPage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsRichEditor } from "@/components/cms/cms-rich-editor";
import { CmsSeoFields } from "@/components/cms/cms-seo-fields";
import { updatePageAction } from "@/app/actions/cms/pages";

export function PageEditForm({ page }: { page: CmsPage }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePageAction(new FormData(e.currentTarget));
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={page.id} />

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" defaultValue={page.title} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={page.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" defaultValue={page.excerpt ?? ""} rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <CmsRichEditor name="content" defaultValue={page.content ?? ""} />
      </div>

      <CmsSeoFields
        defaultMetaTitle={page.seoMetaTitle ?? undefined}
        defaultMetaDescription={page.seoMetaDescription ?? undefined}
      />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPublished" name="isPublished" defaultChecked={page.isPublished} />
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
