"use client";

import { useBot } from "@/lib/dashboard/useBot";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { EmbedSnippetBlock } from "./EmbedSnippetBlock";
import { InstallInstructions } from "./InstallInstructions";
import { ConnectionCheck } from "./ConnectionCheck";

export function InstallPageContent({ botId }: { botId: string }) {
  const { bot } = useBot(botId);

  if (!bot) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  return (
    <>
      <ContentBlock title="Код виджета">
        <EmbedSnippetBlock botId={botId} />
      </ContentBlock>

      <ContentBlock title="Инструкция по установке">
        <InstallInstructions />
      </ContentBlock>

      <ContentBlock title="Проверка подключения">
        <ConnectionCheck />
      </ContentBlock>
    </>
  );
}
