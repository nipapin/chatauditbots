"use client";

import { useBot } from "@/lib/dashboard/useBot";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { KnowledgeUploadZone } from "./KnowledgeUploadZone";
import { AddLinkForm } from "./AddLinkForm";
import { KnowledgeList } from "./KnowledgeList";

export function KnowledgeBaseManager({ botId }: { botId: string }) {
  const { bot, knowledge, data } = useBot(botId);
  const { show } = useToast();

  if (!bot) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  return (
    <>
      <ContentBlock title="Загрузка документов">
        <KnowledgeUploadZone
          onFiles={(files) => {
            for (const file of files) {
              data.addKnowledgeFile(botId, file.name, file.size);
            }
            show(`${files.length > 1 ? "Файлы добавлены" : "Файл добавлен"}, идёт обработка`, "success");
          }}
        />
      </ContentBlock>

      <ContentBlock title="Ссылки на сайт">
        <AddLinkForm
          onAdd={(url) => {
            const title = url.replace(/^https?:\/\//, "").slice(0, 60);
            data.addKnowledgeLink(botId, title, url);
            show("Ссылка добавлена, идёт обработка", "success");
          }}
        />
      </ContentBlock>

      <ContentBlock title={`Материалы (${knowledge.length})`}>
        <KnowledgeList
          docs={knowledge}
          onDelete={(docId) => {
            data.deleteKnowledgeDoc(docId);
            show("Материал удалён", "success");
          }}
        />
      </ContentBlock>
    </>
  );
}
