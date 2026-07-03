import { KnowledgeBaseManager } from "@/components/dashboard/knowledge/KnowledgeBaseManager";

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  return <KnowledgeBaseManager botId={botId} />;
}
