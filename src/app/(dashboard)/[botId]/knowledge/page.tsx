import { KnowledgeBaseManager } from "@/components/dashboard/knowledge/KnowledgeBaseManager";

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  // key={botId}: гарантирует полный ремонт формы при переходе на другого бота —
  // без этого локальный useState-снимок contacts может остаться от предыдущего бота.
  return <KnowledgeBaseManager key={botId} botId={botId} />;
}
