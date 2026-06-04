import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getUserById } from "@/lib/users";
import { Button } from "@/components/ui/button";
import { EditUserForm } from "./edit-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const target = await getUserById(id);
  if (!target) notFound();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/users" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Akun</h1>
          <p className="text-muted-foreground">
            Perbarui data pengguna {target.email}
          </p>
        </div>
      </div>

      <EditUserForm user={target} />
    </div>
  );
}
