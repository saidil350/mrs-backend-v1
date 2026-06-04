import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPageById } from "@/lib/cms/pages";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageEditForm } from "./edit-form";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/pages" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Halaman</h1>
          <p className="text-muted-foreground">{page.title}</p>
        </div>
      </div>
      <PageEditForm page={page} />
    </div>
  );
}
