import { BotEditorShell } from "@/components/dashboard/layout/BotEditorShell";

export default async function BotLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  return <BotEditorShell botId={botId}>{children}</BotEditorShell>;
}
