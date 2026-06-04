"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Post, PostCategory } from "@/types";
import { POST_CATEGORY_LABELS } from "@/types";
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
import { CmsSeoFields } from "@/components/cms/cms-seo-fields";
import { CmsMediaPicker } from "@/components/cms/cms-media-picker";
import { updatePostAction } from "@/app/actions/cms/posts";

export function PostEditForm({ post }: { post: Post }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<PostCategory>(post.category);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePostAction(new FormData(e.currentTarget));
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={post.id} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" defaultValue={post.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={post.slug} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea id="excerpt" name="excerpt" defaultValue={post.excerpt} required maxLength={200} rows={2} />
      </div>

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
          <Input id="author" name="author" defaultValue={post.author} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <CmsRichEditor name="content" defaultValue={post.content ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <CmsTagInput name="tags" defaultValue={post.tags} />
      </div>

      <CmsMediaPicker name="thumbnailId" label="Thumbnail" defaultValue={post.thumbnailId} />

      <CmsSeoFields
        defaultMetaTitle={post.seoMetaTitle ?? undefined}
        defaultMetaDescription={post.seoMetaDescription ?? undefined}
      />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPublished" name="isPublished" defaultChecked={post.isPublished} />
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
