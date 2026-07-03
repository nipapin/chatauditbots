import { LeadsPageContent } from "@/components/dashboard/leads/LeadsPageContent";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  return <LeadsPageContent botId={botId} />;
}
