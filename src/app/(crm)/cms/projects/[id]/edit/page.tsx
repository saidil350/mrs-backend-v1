import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getProjectById } from "@/lib/cms/projects";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectEditForm } from "./edit-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/projects" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">{project.title}</p>
        </div>
      </div>
      <ProjectEditForm project={project} />
    </div>
  );
}
