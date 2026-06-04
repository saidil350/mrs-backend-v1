"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef } from "@/lib/cms/globals-schema";
import { updateGlobalAction } from "@/app/actions/cms/globals";

type Props = {
  globalKey: string;
  data: Record<string, unknown>;
  fields: FieldDef[];
};

export function DynamicForm({ globalKey, data, fields }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, unknown>>({ ...data });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("key", globalKey);
      fd.append("data", JSON.stringify(formData));
      await updateGlobalAction(fd);
      router.push("/cms/globals");
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {fields.map((field) => (
        <FormField
          key={field.key}
          field={field}
          value={formData[field.key]}
          onChange={(v) => setValue(field.key, v)}
          idPrefix={globalKey}
        />
      ))}

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </div>
  );
}

function FormField({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  idPrefix: string;
}) {
  switch (field.type) {
    case "text":
    case "image":
      return <TextField field={field} value={value} onChange={onChange} idPrefix={idPrefix} />;
    case "textarea":
      return <TextAreaField field={field} value={value} onChange={onChange} idPrefix={idPrefix} />;
    case "number":
      return <NumberField field={field} value={value} onChange={onChange} idPrefix={idPrefix} />;
    case "boolean":
      return <BooleanField field={field} value={value} onChange={onChange} idPrefix={idPrefix} />;
    case "array":
      return <ArrayField field={field} value={value} onChange={onChange} idPrefix={idPrefix} />;
    case "group":
      return (
        <GroupField field={field} value={value} onChange={onChange} idPrefix={idPrefix} />
      );
    default:
      return <TextField field={field} value={value} onChange={onChange} idPrefix={idPrefix} />;
  }
}

function TextField({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  idPrefix: string;
}) {
  const inputId = getFieldId(idPrefix, field.key);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{field.label}</Label>
      <Input
        id={inputId}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
      />
    </div>
  );
}

function TextAreaField({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  idPrefix: string;
}) {
  const inputId = getFieldId(idPrefix, field.key);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{field.label}</Label>
      <Textarea
        id={inputId}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
      />
    </div>
  );
}

function NumberField({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  idPrefix: string;
}) {
  const inputId = getFieldId(idPrefix, field.key);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{field.label}</Label>
      <Input
        id={inputId}
        type="number"
        value={String(value ?? "")}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}

function BooleanField({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  idPrefix: string;
}) {
  const inputId = getFieldId(idPrefix, field.key);

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={inputId}
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-input"
      />
      <Label htmlFor={inputId}>{field.label}</Label>
    </div>
  );
}

function GroupField({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  idPrefix: string;
}) {
  const groupData = isRecord(value) ? value : {};

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h3 className="font-medium text-sm">{field.label}</h3>
      {field.fields?.map((subField) => (
        <FormField
          key={subField.key}
          field={subField}
          value={groupData[subField.key]}
          onChange={(v) =>
            onChange({ ...groupData, [subField.key]: v })
          }
          idPrefix={getFieldId(idPrefix, field.key)}
        />
      ))}
    </div>
  );
}

function ArrayField({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  idPrefix: string;
}) {
  const items = Array.isArray(value) ? value : [];
  const firstObject = items.find(isRecord);
  const itemFields = field.itemFields ?? (firstObject ? inferFieldsFromObject(firstObject) : []);
  const objectItems = itemFields.length > 0;

  function updateItem(index: number, nextValue: unknown) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addItem() {
    onChange([...items, objectItems ? createEmptyObject(itemFields) : ""]);
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{field.label}</h3>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="size-3.5" />
          Tambah
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
          Belum ada item
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-md border bg-background p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Item {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeItem(index)}
                  aria-label={`Hapus ${field.label} ${index + 1}`}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>

              {objectItems ? (
                itemFields.map((subField) => {
                  const itemData = isRecord(item) ? item : {};

                  return (
                    <FormField
                      key={subField.key}
                      field={subField}
                      value={itemData[subField.key]}
                      onChange={(nextValue) =>
                        updateItem(index, { ...itemData, [subField.key]: nextValue })
                      }
                      idPrefix={getFieldId(idPrefix, `${field.key}-${index}`)}
                    />
                  );
                })
              ) : (
                <PrimitiveArrayItem
                  field={field}
                  value={item}
                  onChange={(nextValue) => updateItem(index, nextValue)}
                  idPrefix={getFieldId(idPrefix, `${field.key}-${index}`)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrimitiveArrayItem({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  idPrefix: string;
}) {
  const inputId = getFieldId(idPrefix, "value");

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 rounded border-input"
        />
        <Label htmlFor={inputId}>{field.label}</Label>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <Input
        id={inputId}
        type="number"
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
    );
  }

  return (
    <Textarea
      id={inputId}
      value={String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
      rows={2}
    />
  );
}

function inferFieldsFromObject(data: Record<string, unknown>): FieldDef[] {
  return Object.entries(data).map(([key, value]) => {
    if (Array.isArray(value)) {
      const firstObject = value.find(isRecord);

      return {
        key,
        label: formatLabel(key),
        type: "array",
        itemFields: firstObject ? inferFieldsFromObject(firstObject) : undefined,
      };
    }

    if (isRecord(value)) {
      return {
        key,
        label: formatLabel(key),
        type: "group",
        fields: inferFieldsFromObject(value),
      };
    }

    if (typeof value === "boolean") {
      return { key, label: formatLabel(key), type: "boolean" };
    }

    if (typeof value === "number") {
      return { key, label: formatLabel(key), type: "number" };
    }

    if (typeof value === "string" && (value.length > 100 || value.includes("\n"))) {
      return { key, label: formatLabel(key), type: "textarea" };
    }

    return { key, label: formatLabel(key), type: "text" };
  });
}

function createEmptyObject(fields: FieldDef[]) {
  return Object.fromEntries(fields.map((field) => [field.key, createEmptyValue(field)]));
}

function createEmptyValue(field: FieldDef): unknown {
  switch (field.type) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "array":
      return [];
    case "group":
      return createEmptyObject(field.fields ?? []);
    default:
      return "";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getFieldId(prefix: string, key: string) {
  return `${prefix}-${key}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
