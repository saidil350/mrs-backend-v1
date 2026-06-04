import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getProductCategoryById } from "@/lib/cms/product-categories";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProductCategoryForm } from "./edit-form";

export default async function EditProductCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const category = await getProductCategoryById(id);
  if (!category) notFound();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/product-categories" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Kategori Produk</h1>
          <p className="text-muted-foreground">{category.name}</p>
        </div>
      </div>

      <EditProductCategoryForm category={category} />
    </div>
  );
}
