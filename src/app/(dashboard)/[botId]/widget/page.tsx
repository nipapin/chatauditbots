import { WidgetAppearanceForm } from "@/components/dashboard/widget/WidgetAppearanceForm";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  // key={botId}: гарантирует полный ремонт формы при переходе на другого бота —
  // без этого локальный useState-снимок WidgetConfig/welcomeMessage может остаться от предыдущего бота.
  return <WidgetAppearanceForm key={botId} botId={botId} />;
}
