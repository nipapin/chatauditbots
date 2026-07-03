import { DialogsBrowser } from "@/components/dashboard/dialogs/DialogsBrowser";

export default async function DialogsPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  return <DialogsBrowser botId={botId} />;
}
