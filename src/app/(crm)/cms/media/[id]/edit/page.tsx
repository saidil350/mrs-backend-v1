import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMediaById } from "@/lib/cms/media";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditMediaForm } from "./edit-form";

export default async function EditMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const media = await getMediaById(id);
  if (!media) notFound();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/media" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Media</h1>
          <p className="text-muted-foreground">{media.filename}</p>
        </div>
      </div>

      <EditMediaForm media={media} />
    </div>
  );
}
