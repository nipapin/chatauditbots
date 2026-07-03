import { InstallPageContent } from "@/components/dashboard/install/InstallPageContent";

export default async function InstallPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  return <InstallPageContent botId={botId} />;
}
