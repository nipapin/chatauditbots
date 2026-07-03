import { BarChart } from "@/components/dashboard/shared/BarChart";
import type { AnalyticsPoint } from "@/lib/dashboard/types";

export function UsageOverTimeChart({ points }: { points: AnalyticsPoint[] }) {
  const skip = points.length > 14 ? Math.ceil(points.length / 10) : 1;

  const data = points.map((point, i) => {
    const date = new Date(point.date);
    const showLabel = i % skip === 0 || i === points.length - 1;
    return {
      label: showLabel ? date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) : "",
      value: point.dialogs,
    };
  });

  return <BarChart data={data} />;
}
