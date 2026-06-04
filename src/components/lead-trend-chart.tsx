"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

function formatShortDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr));
}

function formatFullDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function LeadTrendChart({
  trend,
}: {
  trend: { date: string; count: number }[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxCount = Math.max(...trend.map((d) => d.count), 1);
  const gridLines = [0, 25, 50, 75, 100];
  const hovered = hoveredIndex !== null ? trend[hoveredIndex] : null;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Tren Lead 14 Hari Terakhir
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Jumlah lead baru yang masuk per hari.
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-6">
        {trend.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada data tren.
          </p>
        ) : (
          <div className="space-y-2">
            {/* Chart area with grid */}
            <div className="relative" style={{ height: 200 }}>
              {/* Horizontal grid lines */}
              {gridLines.map((pct) => (
                <div
                  key={pct}
                  className="absolute left-6 right-0 border-t border-dashed border-border/50"
                  style={{ bottom: `${pct}%` }}
                >
                  <span className="absolute -left-8 -top-3 text-[10px] text-muted-foreground">
                    {Math.round((pct / 100) * maxCount)}
                  </span>
                </div>
              ))}

              {/* Tooltip */}
              {hovered && (
                <div
                  className="absolute z-10 -top-2 flex flex-col items-center pointer-events-none"
                  style={{
                    left: `calc(24px + ${(hoveredIndex! / (trend.length - 1)) * (100 - 2)}%)`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg whitespace-nowrap">
                    <p className="font-semibold">{formatFullDate(hovered.date)}</p>
                    <p className="mt-0.5">{hovered.count} lead</p>
                  </div>
                  <div className="h-2 w-2 rotate-45 -mt-1 bg-foreground" />
                </div>
              )}

              {/* Bars */}
              <div className="absolute left-6 right-0 top-0 bottom-0 flex items-end gap-1.5">
                {trend.map((day, i) => {
                  const barHeight =
                    day.count > 0
                      ? Math.max(8, (day.count / maxCount) * 100)
                      : 4;
                  const isHovered = hoveredIndex === i;
                  return (
                    <div
                      key={day.date}
                      className="relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Highlight column */}
                      {isHovered && (
                        <div className="absolute inset-0 bg-primary/5 rounded-md" />
                      )}
                      {/* Count label on hover */}
                      {isHovered && day.count > 0 && (
                        <span className="absolute text-xs font-bold text-primary mb-1">
                          {day.count}
                        </span>
                      )}
                      <div
                        className="relative w-full rounded-md transition-all duration-200"
                        style={{
                          height: `${barHeight}%`,
                          backgroundColor: isHovered
                            ? "oklch(0.42 0.1 155)"
                            : "oklch(0.55 0.1 155 / 0.5)",
                          minHeight: 4,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date labels */}
            <div className="flex gap-1.5 pl-6">
              {trend.map((day, i) => {
                const isToday = i === trend.length - 1;
                const isHovered = hoveredIndex === i;
                return (
                  <span
                    key={day.date}
                    className={`flex-1 text-center text-[10px] leading-tight transition-colors ${
                      isHovered
                        ? "font-semibold text-primary"
                        : isToday
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                    } ${i % 2 !== 0 ? "hidden sm:block" : ""}`}
                  >
                    {isToday ? "Hari ini" : formatShortDate(day.date)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
