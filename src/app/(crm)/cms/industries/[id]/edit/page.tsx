import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getIndustryById } from "@/lib/cms/industries";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditIndustryForm } from "./edit-form";

export default async function EditIndustryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const industry = await getIndustryById(id);
  if (!industry) notFound();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/industries" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Industri</h1>
          <p className="text-muted-foreground">{industry.name}</p>
        </div>
      </div>

      <EditIndustryForm industry={industry} />
    </div>
  );
}
