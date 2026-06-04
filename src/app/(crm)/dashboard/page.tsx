import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getDashboardData } from "@/lib/leads";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetricCard } from "@/components/metric-card";
import { LeadTrendChart } from "@/components/lead-trend-chart";
import { formatDate } from "@/components/format-date";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  Users,
} from "lucide-react";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  let dashboardError: string | null = null;
  let data: Awaited<ReturnType<typeof getDashboardData>>;

  try {
    data = await getDashboardData();
  } catch (error) {
    dashboardError =
      error instanceof Error
        ? error.message
        : "Data dashboard belum bisa dimuat.";
    console.error("Failed to load dashboard data", error);
    data = {
      summary: {
        total: 0,
        newCount: 0,
        contactedCount: 0,
        conversionRate: 0,
        wonCount: 0,
        unassignedCount: 0,
        emailCount: 0,
        telegramCount: 0,
        whatsappCount: 0,
        totalThisMonth: 0,
        totalLastMonth: 0,
      },
      leads: [],
      pipeline: {
        new: 0,
        contacted: 0,
        qualified: 0,
        proposal_sent: 0,
        won: 0,
        lost: 0,
        rejected: 0,
      },
      sources: [],
      trend: [],
    } as Awaited<ReturnType<typeof getDashboardData>>;
  }

  const { summary, leads, trend } = data;

  // Month-over-month trend for Total Leads card
  const momTrend =
    summary.totalLastMonth > 0
      ? Math.round(
          ((summary.totalThisMonth - summary.totalLastMonth) /
            summary.totalLastMonth) *
            100,
        )
      : summary.totalThisMonth > 0
        ? 100
        : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Error banner */}
      {dashboardError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Data dashboard belum bisa dimuat dari database. {dashboardError}
        </div>
      ) : null}

      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total Leads"
          value={summary.total}
          icon={<Users className="h-4 w-4" />}
          iconBg="bg-emerald-100 text-emerald-700"
          description="Seluruh lead yang tercatat"
          trend={
            momTrend !== 0
              ? { value: momTrend, label: "vs bulan lalu" }
              : undefined
          }
        />
        <MetricCard
          label="Email"
          value={summary.emailCount}
          icon={<Mail className="h-4 w-4" />}
          iconBg="bg-sky-100 text-sky-700"
          description="Lead dengan email"
        />
        <MetricCard
          label="Telegram"
          value={summary.telegramCount}
          icon={<MessageCircle className="h-4 w-4" />}
          iconBg="bg-blue-100 text-blue-700"
          description="Dihubungi via Telegram"
        />
        <MetricCard
          label="WhatsApp"
          value={summary.whatsappCount}
          icon={<PhoneCall className="h-4 w-4" />}
          iconBg="bg-green-100 text-green-700"
          description="Dihubungi via WhatsApp"
        />
      </div>

      {/* Row 2: Lead Trend Chart */}
      <LeadTrendChart trend={trend} />

      {/* Row 3: Last Lead */}
      <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Kontak Terakhir</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kontak terakhir dalam 7 hari terakhir.
                </p>
              </div>
              <Link
                href="/leads"
                className="text-sm font-medium text-primary hover:underline"
              >
                Buka daftar lead
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Client</TableHead>
                    <TableHead className="min-w-[180px]">Kontak</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Belum ada lead terbaru untuk ditampilkan.
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
                          {lead.company && (
                            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5" />
                              {lead.company}
                            </div>
                          )}
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
