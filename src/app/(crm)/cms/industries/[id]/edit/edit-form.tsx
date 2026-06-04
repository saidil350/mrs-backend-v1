"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Industry } from "@/types";
import { updateIndustryAction } from "@/app/actions/cms/industries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsMediaPicker } from "@/components/cms/cms-media-picker";

export function EditIndustryForm({ industry }: { industry: Industry }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [applicationsText, setApplicationsText] = useState(
    industry.applications.join(", ")
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Convert comma-separated applications text to JSON array
      const applications = applicationsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      formData.set("applications", JSON.stringify(applications));

      await updateIndustryAction(formData);
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={industry.id} />

      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          name="name"
          defaultValue={industry.name}
          placeholder="Nama industri"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Input
          id="icon"
          name="icon"
          defaultValue={industry.icon ?? ""}
          placeholder="Nama icon (mis. Factory)"
        />
      </div>

      <CmsMediaPicker name="imageId" label="Image" defaultValue={industry.imageId} />

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={industry.description}
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
          defaultValue={industry.expertiseSummary ?? ""}
          placeholder="Ringkasan keahlian..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicationsText">Aplikasi (pisahkan dengan koma)</Label>
        <Input
          id="applicationsText"
          name="applicationsText"
          value={applicationsText}
          onChange={(e) => setApplicationsText(e.target.value)}
          placeholder="Packaging, Food & Beverage, Healthcare"
        />
        <p className="text-xs text-muted-foreground">
          Pisahkan dengan koma. Contoh: Packaging, Food & Beverage
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Urutan</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={industry.sortOrder}
          min={0}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          name="isPublished"
          defaultChecked={industry.isPublished}
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
