import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeadStatus } from "@/types";
import { LEAD_STATUS_LABELS } from "@/types";
import { Route } from "lucide-react";

const FUNNEL_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
  "rejected",
];

const FUNNEL_COLORS: Record<LeadStatus, { bar: string; text: string }> = {
  new: { bar: "bg-emerald-500", text: "text-emerald-700" },
  contacted: { bar: "bg-sky-500", text: "text-sky-700" },
  qualified: { bar: "bg-violet-500", text: "text-violet-700" },
  proposal_sent: { bar: "bg-amber-500", text: "text-amber-700" },
  won: { bar: "bg-green-600", text: "text-green-700" },
  lost: { bar: "bg-red-400", text: "text-red-600" },
  rejected: { bar: "bg-red-300", text: "text-red-500" },
};

export function PipelineFunnel({
  pipeline,
  total,
}: {
  pipeline: Record<LeadStatus, number>;
  total: number;
}) {
  const safeTotal = total || 1;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          Pipeline
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Distribusi status dari seluruh lead yang tercatat.
        </p>
      </CardHeader>
      <CardContent className="grid gap-2.5 p-4">
        {FUNNEL_ORDER.map((status) => {
          const count = pipeline[status] ?? 0;
          const percentage = Math.round((count / safeTotal) * 100);
          const colors = FUNNEL_COLORS[status];

          return (
            <div key={status} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{LEAD_STATUS_LABELS[status]}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${colors.text}`}>{count}</span>
                  <span className="text-muted-foreground">{percentage}%</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
