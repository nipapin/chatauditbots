import { BotSettingsForm } from "@/components/dashboard/settings/BotSettingsForm";

export default async function BotSettingsPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  return <BotSettingsForm botId={botId} />;
}
