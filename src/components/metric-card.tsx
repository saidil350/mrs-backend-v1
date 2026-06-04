import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  icon,
  description,
  trend,
  iconBg,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: { value: number; label: string };
  iconBg?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {description && (
              <p className="text-xs text-muted-foreground/70">{description}</p>
            )}
          </div>
          {icon && (
            <span
              className={`flex size-9 items-center justify-center rounded-lg ${
                iconBg ?? "bg-muted text-muted-foreground"
              }`}
            >
              {icon}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-end gap-2">
          <p className="text-3xl font-extrabold tracking-tight">{value}</p>
          {trend && trend.value !== 0 && (
            <span
              className={`mb-0.5 flex items-center gap-0.5 text-xs font-semibold ${
                trend.value > 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.value > 0 ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
              <span className="font-normal text-muted-foreground">
                {trend.label}
              </span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
