import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllProjects } from "@/lib/cms/projects";
import { CmsPageHeader } from "@/components/cms/cms-page-header";
import { CmsDeleteButton } from "@/components/cms/cms-delete-button";
import { CmsPublishToggle } from "@/components/cms/cms-publish-toggle";
import { deleteProjectAction, toggleProjectPublishAction } from "@/app/actions/cms/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await getAllProjects();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Projects"
        description={`${projects.length} project`}
        createHref="/cms/projects/new"
        createLabel="Buat Project"
      />

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Belum ada project.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.category ?? "—"}</TableCell>
                  <TableCell>{project.client ?? "—"}</TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={project.id}
                      isPublished={project.isPublished}
                      action={toggleProjectPublishAction}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/projects/${project.id}/edit`} />}>
                          <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={project.id}
                        action={deleteProjectAction}
                        itemName={project.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
