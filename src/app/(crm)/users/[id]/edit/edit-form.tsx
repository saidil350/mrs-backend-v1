"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserAction } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CRMUser, UserRole } from "@/types";

type UserRecord = CRMUser & {
  createdAt: string;
  updatedAt: string;
};

export function EditUserForm({ user }: { user: UserRecord }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(user.role);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("role", role);
      await updateUserAction(formData);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={user.id} />

      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password Baru</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Kosongkan jika tidak ingin mengubah"
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">
          Isi hanya jika ingin mengganti password.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select name="role" value={role} onValueChange={(v) => setRole(v as UserRole)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin (akses penuh)</SelectItem>
            <SelectItem value="sales">Sales (hanya CRM)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
