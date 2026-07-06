"use client";

import { useState } from "react";
import { useBot } from "@/lib/dashboard/useBot";
import { useToast } from "@/components/dashboard/shared/Toast";
import { useDebouncedCallback } from "@/lib/dashboard/useDebouncedCallback";
import { linkifyText } from "@/lib/dashboard/linkify";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Icon } from "@/components/dashboard/icons/Icon";
import { KnowledgeUploadZone } from "./KnowledgeUploadZone";
import { AddLinkForm } from "./AddLinkForm";
import { AddTextForm } from "./AddTextForm";
import { KnowledgeList } from "./KnowledgeList";
import type { Bot } from "@/lib/dashboard/types";

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
  const [contacts, setContacts] = useState(bot?.contacts ?? "");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const debouncedUpdateBot = useDebouncedCallback((patch: Partial<Bot>) => {
    data.updateBot(botId, patch);
  }, 600);

  if (!bot) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  return (
    <>
      <ContentBlock title="Контакты">
        <div className="dash-field" style={{ marginBottom: contacts.trim() ? 12 : 0 }}>
          <label className="dash-label" htmlFor="contacts">
            Мессенджеры и соцсети
          </label>
          <textarea
            id="contacts"
            className="dash-textarea"
            rows={4}
            placeholder="Укажите телефон, email, мессенджеры и соцсети — по одному способу связи на строку"
            value={contacts}
            onChange={(e) => {
              const value = e.target.value;
              setContacts(value);
              debouncedUpdateBot({ contacts: value });
            }}
          />
          <div className="dash-hint">
            Укажите любые способы связи — ссылки станут кликабельными. Бот предложит эти контакты, если не сможет
            ответить сам.
          </div>
        </div>
        {contacts.trim() && (
          <div className="dash-field" style={{ marginBottom: 0 }}>
            <label className="dash-label">Как увидит посетитель</label>
            <div className="dash-card" style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {linkifyText(contacts)}
            </div>
          </div>
        )}
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
