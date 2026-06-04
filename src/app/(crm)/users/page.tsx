import { redirect } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getAllUsers } from "@/lib/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  deleteUserAction,
  usersCountAction,
} from "@/app/actions/users";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [users, total] = await Promise.all([
    getAllUsers(),
    usersCountAction(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Kelola Akun"
        description={`Daftar pengguna CRM (${total} akun)`}
        createHref="/users/new"
        createLabel="Tambah Akun"
      />

      {users.length === 0 ? (
        <div className="rounded-lg border py-12 text-center">
          <p className="text-muted-foreground">Belum ada akun.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === user.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Anda)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role === "admin" ? "Admin" : "Sales"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/users/${u.id}/edit`} />}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        {!isSelf && (
                          <CmsDeleteButton
                            id={u.id}
                            action={deleteUserAction}
                            itemName={u.name}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
