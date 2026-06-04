import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllLeads } from "@/lib/leads";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/format-date";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  Search,
  X,
} from "lucide-react";

export default async function LeadsListPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; company?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const leads = await getAllLeads({
    search: params.search || undefined,
    company: params.company || undefined,
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
  });

  const hasFilters = !!(params.search || params.company || params.dateFrom || params.dateTo);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
          CRM
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Semua Lead
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {leads.length} lead{hasFilters ? " ditemukan" : " tercatat"}. Klik nama lead untuk melihat detail dan follow up.
        </p>
      </div>

      {/* Filter */}
      <form className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Cari nama, email, no. HP..."
              defaultValue={params.search}
              className="pl-9"
            />
          </div>
          <div className="relative lg:col-span-2">
            <Building2 className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="company"
              placeholder="Filter perusahaan..."
              defaultValue={params.company}
              className="pl-9"
            />
          </div>
          <div>
            <Input
              name="dateFrom"
              type="date"
              defaultValue={params.dateFrom}
            />
          </div>
          <div>
            <Input
              name="dateTo"
              type="date"
              defaultValue={params.dateTo}
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button type="submit" size="sm">
            <Search className="mr-1 h-4 w-4" />
            Filter
          </Button>
          {hasFilters && (
            <Link
              href="/leads"
            >
              <Button type="button" variant="outline" size="sm">
                <X className="mr-1 h-4 w-4" />
                Reset
              </Button>
            </Link>
          )}
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Client</TableHead>
                  <TableHead className="min-w-[200px]">Kontak</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      {hasFilters ? "Tidak ada lead yang cocok dengan filter." : "Belum ada lead tercatat."}
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/40">
                      <TableCell>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-semibold hover:underline"
                        >
                          {lead.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.phone || "-"}</span>
                        </div>
                        {lead.email && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {lead.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.company || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(lead.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Lihat detail"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
