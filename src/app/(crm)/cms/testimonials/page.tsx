import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllTestimonials } from "@/lib/cms/testimonials";
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
  deleteTestimonialAction,
  toggleTestimonialPublishAction,
} from "@/app/actions/cms/testimonials";

export default async function TestimonialsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const testimonials = await getAllTestimonials();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Testimonial"
        description={`Kelola testimonial (${testimonials.length} item)`}
        createHref="/cms/testimonials/new"
        createLabel="Tambah Testimonial"
      />

      {testimonials.length === 0 ? (
        <div className="rounded-lg border py-12 text-center">
          <p className="text-muted-foreground">Belum ada testimonial.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Perusahaan</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.company ?? "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {t.quote}
                  </TableCell>
                  <TableCell>{t.rating ?? "-"}</TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={t.id}
                      isPublished={t.isPublished}
                      action={toggleTestimonialPublishAction}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/testimonials/${t.id}/edit`} />}>
                        <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={t.id}
                        action={deleteTestimonialAction}
                        itemName={t.name}
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
