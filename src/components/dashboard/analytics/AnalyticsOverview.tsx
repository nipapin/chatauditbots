"use client";

import { useState } from "react";
import { useBot } from "@/lib/dashboard/useBot";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { ReportStats } from "@/components/dashboard/shared/ReportStats";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { UsageOverTimeChart } from "./UsageOverTimeChart";
import { PopularQuestionsList } from "./PopularQuestionsList";
import { formatDuration, formatPercent } from "@/lib/dashboard/format";
import type { AnalyticsRangeDays } from "@/lib/dashboard/types";

export function AnalyticsOverview({ botId }: { botId: string }) {
  const { bot, data } = useBot(botId);
  const [range, setRange] = useState<AnalyticsRangeDays>(30);

  if (!bot) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  const summary = data.analyticsByBot(botId, range);

  return (
    <>
      <AnalyticsFilters value={range} onChange={setRange} />

      <ContentBlock title="Основные показатели">
        <ReportStats
          items={[
            { value: summary.visitorCount, label: "Посетителей" },
            { value: summary.dialogCount, label: "Диалогов" },
            { value: formatDuration(summary.avgDialogLengthSec), label: "Средняя длина диалога" },
            { value: summary.avgMessagesPerDialog, label: "Сообщений в диалоге" },
            { value: formatPercent(summary.leadConversionRate), label: "Конверсия в заявку" },
          ]}
        />
      </ContentBlock>

      <ContentBlock title="Диалоги по дням">
        <UsageOverTimeChart points={summary.usageByDay} />
      </ContentBlock>

      <ContentBlock title="Популярные вопросы">
        <PopularQuestionsList questions={summary.popularQuestions} />
      </ContentBlock>
    </>
  );
}
