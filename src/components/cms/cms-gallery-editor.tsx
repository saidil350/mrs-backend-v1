"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type GalleryItem = { imageId: string; caption?: string };

type Props = {
  name: string;
  defaultValue?: GalleryItem[];
};

export function CmsGalleryEditor({ name, defaultValue = [] }: Props) {
  const [items, setItems] = useState<GalleryItem[]>(defaultValue);

  function addItem() {
    setItems([...items, { imageId: "", caption: "" }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof GalleryItem, value: string) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Gallery</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-1 size-3" /> Tambah
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              placeholder="Image ID (UUID)"
              value={item.imageId}
              onChange={(e) => updateItem(i, "imageId", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Caption"
              value={item.caption ?? ""}
              onChange={(e) => updateItem(i, "caption", e.target.value)}
            />
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
