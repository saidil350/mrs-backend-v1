import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllProductCategories } from "@/lib/cms/product-categories";
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
  deleteProductCategoryAction,
  toggleProductCategoryPublishAction,
} from "@/app/actions/cms/product-categories";

export default async function ProductCategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const categories = await getAllProductCategories();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Kategori Produk"
        description={`Kelola kategori produk (${categories.length} item)`}
        createHref="/cms/product-categories/new"
        createLabel="Tambah Kategori"
      />

      {categories.length === 0 ? (
        <div className="rounded-lg border py-12 text-center">
          <p className="text-muted-foreground">Belum ada kategori produk.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Urutan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {cat.slug}
                  </TableCell>
                  <TableCell>{cat.icon ?? "-"}</TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={cat.id}
                      isPublished={cat.isPublished}
                      action={toggleProductCategoryPublishAction}
                    />
                  </TableCell>
                  <TableCell>{cat.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/product-categories/${cat.id}/edit`} />}>
                        <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={cat.id}
                        action={deleteProductCategoryAction}
                        itemName={cat.name}
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
