import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllMedia } from "@/lib/cms/media";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteMediaAction } from "@/app/actions/cms/media";

export default async function MediaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const media = await getAllMedia();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Kelola gambar dan dokumen ({media.length} file)
          </p>
        </div>
        <Button render={<Link href="/cms/media/upload" />}>
            <Plus className="mr-2 size-4" />
            Upload
        </Button>
      </div>

      {media.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Belum ada media. Upload file pertama Anda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {item.mimeType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">📄</span>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{item.alt}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.filename}
                </p>
                <div className="flex gap-1 mt-2">
                  <Button variant="outline" size="sm" className="flex-1" render={<Link href={`/cms/media/${item.id}/edit`} />}>
                      <Pencil className="size-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                        <Trash2 className="size-3 text-destructive" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus media?</AlertDialogTitle>
                        <AlertDialogDescription>
                          File &quot;{item.alt}&quot; akan dihapus permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <form action={deleteMediaAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <AlertDialogAction type="submit">
                            Hapus
                          </AlertDialogAction>
                        </form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
