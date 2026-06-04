import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllInnovations } from "@/lib/cms/innovations";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CmsPageHeader } from "@/components/cms/cms-page-header";
import { CmsDeleteButton } from "@/components/cms/cms-delete-button";
import { CmsPublishToggle } from "@/components/cms/cms-publish-toggle";
import {
  deleteInnovationAction,
  toggleInnovationPublishAction,
} from "@/app/actions/cms/innovations";

export default async function InnovationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const innovations = await getAllInnovations();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Inovasi"
        description={`Kelola inovasi (${innovations.length} item)`}
        createHref="/cms/innovations/new"
        createLabel="Tambah Inovasi"
      />

      {innovations.length === 0 ? (
        <div className="rounded-lg border py-12 text-center">
          <p className="text-muted-foreground">Belum ada inovasi.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {innovations.map((inn) => (
                <TableRow key={inn.id}>
                  <TableCell className="font-medium">{inn.title}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {inn.description}
                  </TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={inn.id}
                      isPublished={inn.isPublished}
                      action={toggleInnovationPublishAction}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/innovations/${inn.id}/edit`} />}>
                        <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={inn.id}
                        action={deleteInnovationAction}
                        itemName={inn.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
