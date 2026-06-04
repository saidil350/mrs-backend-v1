import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getTeamMemberById } from "@/lib/cms/team";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditTeamMemberForm } from "./edit-form";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const member = await getTeamMemberById(id);
  if (!member) notFound();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/team" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Anggota Tim</h1>
          <p className="text-muted-foreground">{member.name}</p>
        </div>
      </div>

      <EditTeamMemberForm member={member} />
    </div>
  );
}
