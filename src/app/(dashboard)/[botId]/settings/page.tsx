import { BotSettingsForm } from "@/components/dashboard/settings/BotSettingsForm";

export default async function BotSettingsPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  // key={botId}: гарантирует полный ремонт формы при переходе на другого бота —
  // без этого локальный useState-снимок Bot/WidgetConfig может остаться от предыдущего бота.
  return <BotSettingsForm key={botId} botId={botId} />;
}
