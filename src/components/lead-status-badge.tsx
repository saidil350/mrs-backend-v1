import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/types";
import { LEAD_STATUS_LABELS } from "@/types";

const statusVariant: Record<LeadStatus, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  contacted: "default",
  qualified: "secondary",
  proposal_sent: "secondary",
  won: "outline",
  lost: "destructive",
  rejected: "destructive",
};

const statusClass: Record<LeadStatus, string> = {
  new: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  contacted: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  qualified: "bg-violet-100 text-violet-800 hover:bg-violet-100",
  proposal_sent: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  won: "bg-green-200 text-green-900 hover:bg-green-200",
  lost: "bg-red-100 text-red-800 hover:bg-red-100",
  rejected: "bg-red-100 text-red-800 hover:bg-red-100",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={statusVariant[status]} className={statusClass[status]}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}
