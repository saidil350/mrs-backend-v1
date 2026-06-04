import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/components/format-date";
import type { LeadActivity } from "@/types";
import { LEAD_STATUS_LABELS } from "@/types";

export function ActivityTimeline({
  activities,
}: {
  activities: LeadActivity[];
}) {
  if (activities.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Belum ada aktivitas.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, i) => (
        <div key={activity.id}>
          <div className="flex gap-3 py-3">
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm">{activity.body}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                {activity.userName || "System"} · {formatDate(activity.createdAt)}
                {activity.fromStatus && activity.toStatus
                  ? ` · ${LEAD_STATUS_LABELS[activity.fromStatus]} → ${LEAD_STATUS_LABELS[activity.toStatus]}`
                  : ""}
              </div>
            </div>
          </div>
          {i < activities.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
