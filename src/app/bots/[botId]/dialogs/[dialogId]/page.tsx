import { DialogDetail } from "@/components/dashboard/dialogs/DialogDetail";

export default async function DialogDetailPage({
  params,
}: {
  params: Promise<{ botId: string; dialogId: string }>;
}) {
  const { botId, dialogId } = await params;
  return <DialogDetail botId={botId} dialogId={dialogId} />;
}
