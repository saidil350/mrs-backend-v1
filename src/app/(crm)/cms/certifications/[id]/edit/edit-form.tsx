"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Certification } from "@/types";
import { updateCertificationAction } from "@/app/actions/cms/certifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CmsMediaPicker } from "@/components/cms/cms-media-picker";

export function EditCertificationForm({
  certification,
}: {
  certification: Certification;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      await updateCertificationAction(formData);
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={certification.id} />

      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          name="name"
          defaultValue={certification.name}
          placeholder="Nama sertifikasi"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="issuer">Issuer</Label>
        <Input
          id="issuer"
          name="issuer"
          defaultValue={certification.issuer}
          placeholder="Lembaga penerbit"
          required
        />
      </div>

      <CmsMediaPicker name="logoId" label="Logo" defaultValue={certification.logoId} />

      <div className="space-y-2">
        <Label htmlFor="year">Tahun</Label>
        <Input
          id="year"
          name="year"
          type="number"
          defaultValue={certification.year ?? ""}
          placeholder="2024"
          min={1900}
          max={2100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={certification.description ?? ""}
          placeholder="Deskripsi sertifikasi..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="documentUrl">Document URL</Label>
        <Input
          id="documentUrl"
          name="documentUrl"
          defaultValue={certification.documentUrl ?? ""}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Urutan</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={certification.sortOrder}
          min={0}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          name="isPublished"
          defaultChecked={certification.isPublished}
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
