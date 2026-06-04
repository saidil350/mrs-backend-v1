"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestimonialAction } from "@/app/actions/cms/testimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsMediaPicker } from "@/components/cms/cms-media-picker";

export function NewTestimonialForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createTestimonialAction(formData);
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
          placeholder="Nama lengkap"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Perusahaan</Label>
        <Input
          id="company"
          name="company"
          placeholder="Nama perusahaan"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role / Jabatan</Label>
        <Input
          id="role"
          name="role"
          placeholder="CEO, Manager, dll."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote">Quote</Label>
        <Textarea
          id="quote"
          name="quote"
          placeholder="Testimonial quote..."
          rows={4}
          required
        />
      </div>

      <CmsMediaPicker name="avatarId" label="Avatar" />

      <div className="space-y-2">
        <Label htmlFor="rating">Rating (1-5)</Label>
        <Input
          id="rating"
          name="rating"
          type="number"
          placeholder="5"
          min={1}
          max={5}
        />
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
