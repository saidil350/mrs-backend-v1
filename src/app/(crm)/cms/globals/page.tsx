import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllGlobals } from "@/lib/cms/globals";
import { GLOBALS_SCHEMAS } from "@/lib/cms/globals-schema";
import {
  countFilledTopLevelFields,
  generateFieldsFromData,
  mergeSchemaFields,
  normalizeGlobalData,
} from "@/lib/cms/global-form-fields";
import { CmsPageHeader } from "@/components/cms/cms-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings2, Building2, Megaphone } from "lucide-react";
import Link from "next/link";

const GROUP_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  brand: { label: "Brand", icon: Settings2 },
  company: { label: "Perusahaan", icon: Building2 },
  marketing: { label: "Marketing", icon: Megaphone },
};

export default async function GlobalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const globals = await getAllGlobals();
  const globalsMap = new Map(globals.map((g) => [g.key, g]));

  const groups = ["brand", "company", "marketing"] as const;

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader title="Brand & Globals" description="Kelola data brand, profil perusahaan, dan marketing" />

      {groups.map((group) => {
        const items = GLOBALS_SCHEMAS.filter((g) => g.group === group);
        if (items.length === 0) return null;
        const meta = GROUP_META[group];

        return (
          <div key={group} className="space-y-3">
            <div className="flex items-center gap-2">
              {meta.icon && <meta.icon className="size-5 text-muted-foreground" />}
              <h2 className="text-lg font-semibold">{meta.label}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((schema) => {
                const g = globalsMap.get(schema.key);
                const data = g ? normalizeGlobalData(g.data) : {};
                const fields = mergeSchemaFields(schema.fields, generateFieldsFromData(data));
                const filledCount = countFilledTopLevelFields(data);
                const totalFields = fields.length;

                return (
                  <Link key={schema.key} href={`/cms/globals/${schema.key}`}>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {schema.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">
                          {schema.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {filledCount}/{totalFields} fields
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
