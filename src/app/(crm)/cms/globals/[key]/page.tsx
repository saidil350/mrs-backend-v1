import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getGlobal } from "@/lib/cms/globals";
import { getSchema } from "@/lib/cms/globals-schema";
import { GLOBALS_REGISTRY } from "@/lib/cms/globals";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicForm } from "@/components/cms/cms-dynamic-form";
import {
  generateFieldsFromData,
  mergeSchemaFields,
  normalizeGlobalData,
} from "@/lib/cms/global-form-fields";

export default async function GlobalEditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { key } = await params;
  const meta = GLOBALS_REGISTRY.find((g) => g.key === key);
  if (!meta) notFound();

  const g = await getGlobal(key);
  if (!g) notFound();

  const schema = getSchema(key);
  const data = normalizeGlobalData(g.data);
  const fields = mergeSchemaFields(schema?.fields ?? [], generateFieldsFromData(data));

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/globals" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{meta.label}</h1>
          <p className="text-muted-foreground">{meta.description}</p>
        </div>
      </div>
      <DynamicForm globalKey={key} data={data} fields={fields} />
    </div>
  );
}
