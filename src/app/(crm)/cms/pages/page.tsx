import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllPages } from "@/lib/cms/pages";
import { CmsPageHeader } from "@/components/cms/cms-page-header";
import { CmsDeleteButton } from "@/components/cms/cms-delete-button";
import { CmsPublishToggle } from "@/components/cms/cms-publish-toggle";
import { deletePageAction, togglePagePublishAction } from "@/app/actions/cms/pages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default async function PagesListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const pages = await getAllPages();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Pages"
        description={`${pages.length} halaman`}
        createHref="/cms/pages/new"
        createLabel="Buat Halaman"
      />

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Belum ada halaman.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={page.id}
                      isPublished={page.isPublished}
                      action={togglePagePublishAction}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(page.updatedAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/pages/${page.id}/edit`} />}>
                          <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={page.id}
                        action={deletePageAction}
                        itemName={page.title}
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
