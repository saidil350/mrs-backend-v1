import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

const BAR_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

export function LeadSourceBreakdown({
  sources,
  total,
}: {
  sources: { source: string; count: number; percentage: number }[];
  total: number;
}) {
  // Top 5 sources + bucket sisanya sebagai "Lainnya"
  const top5 = sources.slice(0, 5);
  const restCount = sources.slice(5).reduce((sum, s) => sum + s.count, 0);

  const displaySources =
    restCount > 0
      ? [
          ...top5,
          {
            source: "Lainnya",
            count: restCount,
            percentage: total > 0 ? Math.round((restCount / total) * 100) : 0,
          },
        ]
      : top5;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Sumber Lead
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Halaman asal lead masuk ke CRM.
        </p>
      </CardHeader>
      <CardContent className="p-4">
        {displaySources.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada data sumber lead.
          </p>
        ) : (
          <div className="grid gap-3.5">
            {displaySources.map((item, i) => (
              <div key={item.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{item.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.count}</span>
                    <span className="text-muted-foreground">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      BAR_COLORS[i % BAR_COLORS.length]
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
