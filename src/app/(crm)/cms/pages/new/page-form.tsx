"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsRichEditor } from "@/components/cms/cms-rich-editor";
import { CmsSeoFields } from "@/components/cms/cms-seo-fields";
import { createPageAction } from "@/app/actions/cms/pages";

export function PageForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await createPageAction(new FormData(e.currentTarget));
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
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <CmsRichEditor name="content" />
      </div>

      <CmsSeoFields />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPublished" name="isPublished" />
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
