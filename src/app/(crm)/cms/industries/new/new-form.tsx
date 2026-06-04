"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createIndustryAction } from "@/app/actions/cms/industries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsMediaPicker } from "@/components/cms/cms-media-picker";

export function NewIndustryForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      // Parse comma-separated applications into JSON string
      const appsInput = (document.getElementById("applicationsText") as HTMLInputElement)?.value || "";
      const applications = appsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      formData.set("applications", JSON.stringify(applications));
      await createIndustryAction(formData);
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
          placeholder="Nama industri"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Input id="icon" name="icon" placeholder="Nama icon (mis. Factory)" />
      </div>

      <CmsMediaPicker name="imageId" label="Image" />

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Deskripsi industri..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expertiseSummary">Ringkasan Keahlian</Label>
        <Textarea
          id="expertiseSummary"
          name="expertiseSummary"
          placeholder="Ringkasan keahlian..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicationsText">Aplikasi (pisahkan dengan koma)</Label>
        <Input
          id="applicationsText"
          name="applicationsText"
          placeholder="Packaging, Food & Beverage, Healthcare"
        />
        <p className="text-xs text-muted-foreground">
          Pisahkan dengan koma. Contoh: Packaging, Food & Beverage
        </p>
      </div>

      <input type="hidden" name="applications" value="[]" />

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
