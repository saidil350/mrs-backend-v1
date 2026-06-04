import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getCmsCounts } from "@/lib/cms/counts";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

function getGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const counts = await getCmsCounts();

  return (
    <SidebarProvider>
      <AppSidebar user={user} counts={counts} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 gap-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-5" />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {getGreeting()}
              </p>
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold">{user.name}</h2>
                {user.role === "admin" && (
                  <Badge className="gap-1" variant="default">
                    <ShieldCheck className="size-3" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
