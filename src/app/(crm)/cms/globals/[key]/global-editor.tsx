"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateGlobalAction } from "@/app/actions/cms/globals";

type Props = {
  globalKey: string;
  data: Record<string, unknown>;
};

export function GlobalEditor({ globalKey, data }: Props) {
  const router = useRouter();
  const [json, setJson] = useState(JSON.stringify(data, null, 2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("JSON tidak valid. Periksa formatnya.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("key", globalKey);
      formData.append("data", JSON.stringify(parsed));
      await updateGlobalAction(formData);
      router.push("/cms/globals");
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="key" value={globalKey} />

      <div className="space-y-2">
        <Label>Data (JSON)</Label>
        <p className="text-xs text-muted-foreground">
          Edit data JSON untuk global <strong>{globalKey}</strong>. Pastikan format JSON valid sebelum menyimpan.
        </p>
        <Textarea
          value={json}
          onChange={(e) => { setJson(e.target.value); setError(null); }}
          rows={20}
          className="font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </div>
  );
}
