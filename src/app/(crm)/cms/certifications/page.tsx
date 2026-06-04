import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllCertifications } from "@/lib/cms/certifications";
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
  deleteCertificationAction,
  toggleCertificationPublishAction,
} from "@/app/actions/cms/certifications";

export default async function CertificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const certifications = await getAllCertifications();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Sertifikasi"
        description={`Kelola sertifikasi (${certifications.length} item)`}
        createHref="/cms/certifications/new"
        createLabel="Tambah Sertifikasi"
      />

      {certifications.length === 0 ? (
        <div className="rounded-lg border py-12 text-center">
          <p className="text-muted-foreground">Belum ada sertifikasi.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Tahun</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certifications.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.name}</TableCell>
                  <TableCell>{cert.issuer}</TableCell>
                  <TableCell>{cert.year ?? "-"}</TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={cert.id}
                      isPublished={cert.isPublished}
                      action={toggleCertificationPublishAction}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/certifications/${cert.id}/edit`} />}>
                        <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={cert.id}
                        action={deleteCertificationAction}
                        itemName={cert.name}
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
