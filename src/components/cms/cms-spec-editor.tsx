"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type SpecItem = { label: string; value: string };

type Props = {
  name: string;
  defaultValue?: SpecItem[];
};

export function CmsSpecEditor({ name, defaultValue = [] }: Props) {
  const [items, setItems] = useState<SpecItem[]>(defaultValue);

  function addItem() {
    setItems([...items, { label: "", value: "" }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof SpecItem, value: string) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Specifications</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-1 size-3" /> Tambah
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="flex-1">
            <Input placeholder="Label" value={item.label} onChange={(e) => updateItem(i, "label", e.target.value)} />
          </div>
          <div className="flex-1">
            <Input placeholder="Value" value={item.value} onChange={(e) => updateItem(i, "value", e.target.value)} />
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}
