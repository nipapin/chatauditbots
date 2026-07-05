"use client";

import { useState } from "react";
import { useBot } from "@/lib/dashboard/useBot";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Icon } from "@/components/dashboard/icons/Icon";
import { KnowledgeUploadZone } from "./KnowledgeUploadZone";
import { AddLinkForm } from "./AddLinkForm";
import { AddTextForm } from "./AddTextForm";
import { KnowledgeList } from "./KnowledgeList";

const TEXT_MIME_TYPES = ["text/plain", "text/csv", "text/markdown", "application/json"];

async function readFileContent(file: File): Promise<string | undefined> {
  if (!TEXT_MIME_TYPES.includes(file.type)) return undefined;
  try {
    return await file.text();
  } catch {
    return undefined;
  }
}

export function KnowledgeBaseManager({ botId }: { botId: string }) {
  const { bot, knowledge, data } = useBot(botId);
  const { show } = useToast();
  const [contactEmail, setContactEmail] = useState(bot?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(bot?.contactPhone ?? "");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  if (!bot) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  return (
    <>
      <ContentBlock title="Контакты">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="dash-field" style={{ marginBottom: 0 }}>
            <label className="dash-label" htmlFor="contact-email">
              Email
            </label>
            <input
              id="contact-email"
              className="dash-input"
              type="email"
              placeholder="info@company.ru"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              onBlur={() => data.updateBot(botId, { contactEmail })}
            />
          </div>
          <div className="dash-field" style={{ marginBottom: 0 }}>
            <label className="dash-label" htmlFor="contact-phone">
              Телефон
            </label>
            <input
              id="contact-phone"
              className="dash-input"
              type="tel"
              placeholder="+7 900 000-00-00"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              onBlur={() => data.updateBot(botId, { contactPhone })}
            />
          </div>
        </div>
        <div className="dash-hint">Бот будет предлагать эти контакты, если не сможет ответить сам.</div>
      </ContentBlock>

      <ContentBlock title="Загрузка документов">
        <KnowledgeUploadZone
          onFiles={async (files) => {
            for (const file of files) {
              const content = await readFileContent(file);
              data.addKnowledgeFile(botId, file.name, file.size, content);
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

      <ContentBlock title="Добавить текст">
        <AddTextForm
          onAdd={(title, text) => {
            data.addKnowledgeText(botId, title, text);
            show("Текст добавлен, идёт обработка", "success");
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

      <ContentBlock title="Резюме базы знаний">
        {bot.knowledgeSummary ? (
          <div className="dash-card" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
            {bot.knowledgeSummary}
          </div>
        ) : (
          <div className="dash-hint" style={{ marginBottom: 10 }}>
            Резюме ещё не сформировано — сгенерируйте его на основе загруженных материалов.
          </div>
        )}
        <button
          type="button"
          className="dash-btn"
          disabled={generatingSummary}
          onClick={async () => {
            setGeneratingSummary(true);
            try {
              await data.generateKnowledgeSummary(botId);
              show("Резюме базы знаний обновлено", "success");
            } catch (err) {
              show(err instanceof Error ? err.message : "Не удалось сгенерировать резюме", "danger");
            } finally {
              setGeneratingSummary(false);
            }
          }}
        >
          <Icon name={generatingSummary ? "clock" : "bot"} size={14} />
          {generatingSummary ? "Генерируем..." : bot.knowledgeSummary ? "Обновить резюме" : "Сгенерировать резюме"}
        </button>
      </ContentBlock>
    </>
  );
}
