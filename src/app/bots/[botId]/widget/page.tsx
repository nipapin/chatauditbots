import { WidgetAppearanceForm } from "@/components/dashboard/widget/WidgetAppearanceForm";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  return <WidgetAppearanceForm botId={botId} />;
}
