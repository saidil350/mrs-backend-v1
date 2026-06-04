import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllTeamMembers } from "@/lib/cms/team";
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
  deleteTeamMemberAction,
  toggleTeamMemberPublishAction,
} from "@/app/actions/cms/team";

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const members = await getAllTeamMembers();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Tim"
        description={`Kelola anggota tim (${members.length} item)`}
        createHref="/cms/team/new"
        createLabel="Tambah Anggota"
      />

      {members.length === 0 ? (
        <div className="rounded-lg border py-12 text-center">
          <p className="text-muted-foreground">Belum ada anggota tim.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.role}</TableCell>
                  <TableCell>{m.email ?? "-"}</TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={m.id}
                      isPublished={m.isPublished}
                      action={toggleTeamMemberPublishAction}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/team/${m.id}/edit`} />}>
                        <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={m.id}
                        action={deleteTeamMemberAction}
                        itemName={m.name}
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
