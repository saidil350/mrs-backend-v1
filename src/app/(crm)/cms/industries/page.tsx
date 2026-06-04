import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllIndustries } from "@/lib/cms/industries";
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
  deleteIndustryAction,
  toggleIndustryPublishAction,
} from "@/app/actions/cms/industries";

export default async function IndustriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const industries = await getAllIndustries();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Industri"
        description={`Kelola industri (${industries.length} item)`}
        createHref="/cms/industries/new"
        createLabel="Tambah Industri"
      />

      {industries.length === 0 ? (
        <div className="rounded-lg border py-12 text-center">
          <p className="text-muted-foreground">Belum ada industri.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {industries.map((ind) => (
                <TableRow key={ind.id}>
                  <TableCell className="font-medium">{ind.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {ind.description}
                  </TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={ind.id}
                      isPublished={ind.isPublished}
                      action={toggleIndustryPublishAction}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/industries/${ind.id}/edit`} />}>
                        <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={ind.id}
                        action={deleteIndustryAction}
                        itemName={ind.name}
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
