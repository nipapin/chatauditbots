import { AnalyticsOverview } from "@/components/dashboard/analytics/AnalyticsOverview";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  return <AnalyticsOverview botId={botId} />;
}
