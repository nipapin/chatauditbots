"use client";

import { useBot } from "@/lib/dashboard/useBot";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { Icon } from "@/components/dashboard/icons/Icon";
import { EmbedSnippetBlock } from "./EmbedSnippetBlock";
import { InstallInstructions } from "./InstallInstructions";
import { ConnectionCheck } from "./ConnectionCheck";

export function InstallPageContent({ botId }: { botId: string }) {
  const { bot } = useBot(botId);

  if (!bot) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  if (bot.planTier === "free") {
    return (
      <ContentBlock title="Установка">
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Установка виджета на сайт доступна на платном тарифе</div>
          <div style={{ fontSize: 13, color: "var(--dash-text-secondary)", lineHeight: 1.6 }}>
            На бесплатном тарифе код виджета скрыт. Перейдите на платный тариф, чтобы получить код для установки на
            сайт и включить чат для посетителей.
          </div>
          <a
            href="https://chataudit.ru/pricing"
            target="_blank"
            rel="noreferrer"
            className="dash-btn dash-btn-primary"
          >
            <Icon name="code" size={14} />
            Посмотреть тарифы
          </a>
        </div>
      </ContentBlock>
    );
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
