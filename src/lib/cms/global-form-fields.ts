import type { FieldDef } from "@/lib/cms/globals-schema";

export function normalizeGlobalData(data: Record<string, unknown>): Record<string, unknown> {
  return normalizeValue(data) as Record<string, unknown>;
}

export function mergeSchemaFields(schemaFields: FieldDef[], generatedFields: FieldDef[]) {
  const schemaKeys = new Set(schemaFields.map((field) => field.key));
  return [
    ...schemaFields,
    ...generatedFields.filter((field) => !schemaKeys.has(field.key)),
  ];
}

export function generateFieldsFromData(data: Record<string, unknown>): FieldDef[] {
  return Object.entries(data).map(([key, value]) => generateFieldFromValue(key, value));
}

export function countFilledTopLevelFields(data: Record<string, unknown>) {
  return Object.values(data).filter((value) => {
    if (value == null || value === "" || value === 0) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (isRecord(value)) return Object.keys(value).length > 0;
    return true;
  }).length;
}

function generateFieldFromValue(key: string, value: unknown): FieldDef {
  if (Array.isArray(value)) {
    const firstObject = value.find(isRecord);

    return {
      key,
      label: formatLabel(key),
      type: "array",
      itemFields: firstObject ? generateFieldsFromData(firstObject) : undefined,
    };
  }

  if (isRecord(value)) {
    return {
      key,
      label: formatLabel(key),
      type: "group",
      fields: generateFieldsFromData(value),
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
}

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, childValue]) => [key, normalizeValue(childValue)]),
    );
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith("[") && !trimmed.startsWith("{"))) {
    return value;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed) || isRecord(parsed)) {
      return normalizeValue(parsed);
    }
  } catch {
    return value;
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
