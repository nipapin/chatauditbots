import { redirect } from "next/navigation";

export default async function BotOverviewPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  redirect(`/bots/${botId}/settings`);
}
