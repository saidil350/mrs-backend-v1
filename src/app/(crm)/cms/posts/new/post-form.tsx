"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CmsRichEditor } from "@/components/cms/cms-rich-editor";
import { CmsTagInput } from "@/components/cms/cms-tag-input";
// SEO fields removed: handled automatically or omitted
import { CmsMediaPicker } from "@/components/cms/cms-media-picker";
import { POST_CATEGORY_LABELS } from "@/types";
import { createPostAction } from "@/app/actions/cms/posts";
import { generateSlug } from "@/lib/slug";
import type { PostCategory } from "@/types";

export function PostForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<PostCategory>("umum");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await createPostAction(new FormData(e.currentTarget));
    } catch {
      setSaving(false);
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = document.getElementById("slug") as HTMLInputElement | null;
    if (slugInput) slugInput.value = generateSlug(e.target.value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" required onChange={handleTitleChange} />
        </div>
        <div className="space-y-2">
          {/* Hidden slug field: auto-generated from title */}
          <input type="hidden" id="slug" name="slug" />
        </div>
      </div>

      {/* Excerpt removed from admin form */}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select name="category" value={category} onValueChange={(v) => setCategory(v as PostCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(POST_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input id="author" name="author" defaultValue="Tim Redaksi" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <CmsRichEditor name="content" />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <CmsTagInput name="tags" />
      </div>

      <CmsMediaPicker name="thumbnailId" label="Thumbnail" />

      {/* SEO fields removed from admin UI */}

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
