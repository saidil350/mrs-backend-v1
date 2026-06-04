import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { NewUserForm } from "./new-form";

export default async function NewUserPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/users" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tambah Akun</h1>
          <p className="text-muted-foreground">
            Buat pengguna baru untuk login ke CRM
          </p>
        </div>
      </div>

      <NewUserForm />
    </div>
  );
}
