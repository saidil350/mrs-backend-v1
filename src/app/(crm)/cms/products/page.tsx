import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllProducts } from "@/lib/cms/products";
import { CmsPageHeader } from "@/components/cms/cms-page-header";
import { CmsDeleteButton } from "@/components/cms/cms-delete-button";
import { CmsPublishToggle } from "@/components/cms/cms-publish-toggle";
import { deleteProductAction, toggleProductPublishAction } from "@/app/actions/cms/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Star } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const products = await getAllProducts();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Products"
        description={`${products.length} produk`}
        createHref="/cms/products/new"
        createLabel="Buat Produk"
      />

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Belum ada produk.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.categoryId ? (
                      <Badge variant="outline">{product.categoryId.slice(0, 8)}...</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {product.featured && <Star className="size-4 fill-yellow-400 text-yellow-400" />}
                  </TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={product.id}
                      isPublished={product.isPublished}
                      action={toggleProductPublishAction}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/products/${product.id}/edit`} />}>
                          <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={product.id}
                        action={deleteProductAction}
                        itemName={product.name}
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
