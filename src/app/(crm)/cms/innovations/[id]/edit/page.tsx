import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getInnovationById } from "@/lib/cms/innovations";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditInnovationForm } from "./edit-form";

export default async function EditInnovationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const innovation = await getInnovationById(id);
  if (!innovation) notFound();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/innovations" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Inovasi</h1>
          <p className="text-muted-foreground">{innovation.title}</p>
        </div>
      </div>

      <EditInnovationForm innovation={innovation} />
    </div>
  );
}
