import { notFound, redirect } from "next/navigation";
import { getLeadDetail } from "@/lib/leads";
import { getCurrentUser } from "@/lib/session";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { formatDate } from "@/components/format-date";
import { Copy, ExternalLink, Phone, MessageCircle, Mail } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title={`Salin: ${text}`}
      data-copy={text}
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}

function getChannel(sourcePage: string | null): "whatsapp" | "telegram" | "email" | null {
  if (!sourcePage) return null;
  const lower = sourcePage.toLowerCase();
  if (lower.includes("telegram")) return "telegram";
  if (lower.includes("whatsapp")) return "whatsapp";
  if (lower.includes("email")) return "email";
  return null;
}

function phoneToWhatsappUrl(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

function phoneToTelegramUrl(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://t.me/+${digits}`;
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { lead } = await getLeadDetail(id);
  if (!lead) notFound();

  const channel = getChannel(lead.sourcePage);

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
            Lead Detail
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {lead.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.company || "Tanpa perusahaan"} · {formatDate(lead.createdAt)}
          </p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      {/* Lead info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi lead</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Nomor Telepon / WhatsApp / Telegram */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <Label className="text-muted-foreground">
                {channel === "telegram" ? "Telegram" : "Nomor Telepon"}
              </Label>
              <p className="mt-0.5 font-semibold">{lead.phone}</p>
            </div>
            <div className="flex items-center gap-1">
              <CopyButton text={lead.phone} />
              {channel === "telegram" ? (
                <a
                  href={phoneToTelegramUrl(lead.phone)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-7 items-center justify-center rounded-md text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  title="Buka Telegram"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              ) : (
                <a
                  href={phoneToWhatsappUrl(lead.phone)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-7 items-center justify-center rounded-md text-green-600 transition-colors hover:bg-green-50 hover:text-green-700"
                  title="Buka WhatsApp"
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="mt-0.5 font-semibold">{lead.email || "-"}</p>
            </div>
            {lead.email && (
              <div className="flex items-center gap-1">
                <CopyButton text={lead.email} />
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex size-7 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                  title="Kirim Email"
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Perusahaan */}
          <div>
            <Label className="text-muted-foreground">Perusahaan</Label>
            <p className="mt-0.5 font-semibold">
              {lead.company || "-"}
            </p>
          </div>

          {/* Pesan */}
          <div>
            <Label className="text-muted-foreground">Pesan</Label>
            <p className="mt-0.5 whitespace-pre-wrap">{lead.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Copy-to-clipboard script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelectorAll('[data-copy]').forEach(function(btn) {
              btn.addEventListener('click', function() {
                var text = this.getAttribute('data-copy');
                navigator.clipboard.writeText(text).then(function() {
                  var icon = btn.querySelector('svg');
                  if (icon) {
                    icon.innerHTML = '<path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
                    btn.classList.add('text-green-600');
                    setTimeout(function() {
                      icon.innerHTML = '<rect width="14" height="14" x="8" y="8" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" stroke="currentColor" stroke-width="2"/>';
                      btn.classList.remove('text-green-600');
                    }, 1500);
                  }
                });
              });
            });
          `,
        }}
      />
    </div>
  );
}
