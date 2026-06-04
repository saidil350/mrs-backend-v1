import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadForm } from "./upload-form";

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/media" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload Media</h1>
          <p className="text-muted-foreground">
            Upload gambar atau dokumen baru
          </p>
        </div>
      </div>

      <UploadForm />
    </div>
  );
}
