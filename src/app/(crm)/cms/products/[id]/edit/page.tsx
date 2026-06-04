import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getProductById } from "@/lib/cms/products";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductEditForm } from "./edit-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/products" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Produk</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>
      <ProductEditForm product={product} />
    </div>
  );
}
