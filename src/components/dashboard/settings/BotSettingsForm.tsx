"use client";

import { useState } from "react";
import { useBot } from "@/lib/dashboard/useBot";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Avatar } from "@/components/dashboard/shared/Avatar";
import { MessageLimitControl } from "./MessageLimitControl";
import type { Bot } from "@/lib/dashboard/types";

export function BotSettingsForm({ botId }: { botId: string }) {
  const { bot, data } = useBot(botId);
  const { show } = useToast();
  const [form, setForm] = useState<Bot | null>(bot ?? null);

  if (!bot || !form) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  const patch = (p: Partial<Bot>) => setForm((prev) => (prev ? { ...prev, ...p } : prev));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Отправляем только поля, которые редактируются на этой странице — иначе
        // устаревший снимок формы может затереть welcomeMessage/contactEmail и
        // другие поля Bot, отредактированные на других страницах (Внешний вид, База знаний).
        data.updateBot(botId, {
          name: form.name,
          avatarUrl: form.avatarUrl,
          status: form.status,
          systemPrompt: form.systemPrompt,
          messageLimit: form.messageLimit,
        });
        show("Настройки сохранены", "success");
      }}
    >
      <ContentBlock title="Основное">
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Avatar name={form.name || "Бот"} imageUrl={form.avatarUrl} size={56} />
            <label className="dash-btn" style={{ fontSize: 11, padding: "0 10px", height: 26, cursor: "pointer" }}>
              Загрузить
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  patch({ avatarUrl: URL.createObjectURL(file) });
                }}
              />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <div className="dash-field">
              <label className="dash-label" htmlFor="bot-name-field">
                Название бота
              </label>
              <input
                id="bot-name-field"
                className="dash-input"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </div>
            <div className="dash-field" style={{ marginBottom: 0 }}>
              <label className="dash-label" htmlFor="bot-status-field">
                Статус
              </label>
              <select
                id="bot-status-field"
                className="dash-select"
                value={form.status}
                onChange={(e) => patch({ status: e.target.value as Bot["status"] })}
              >
                <option value="draft">Черновик</option>
                <option value="active">Активен</option>
                <option value="paused">На паузе</option>
              </select>
            </div>
          </div>
        </div>

        <div className="dash-field" style={{ marginBottom: 0 }}>
          <label className="dash-label" htmlFor="system-prompt">
            Системная инструкция (промпт)
          </label>
          <textarea
            id="system-prompt"
            className="dash-textarea"
            rows={5}
            value={form.systemPrompt}
            onChange={(e) => patch({ systemPrompt: e.target.value })}
          />
          <div className="dash-hint">Определяет роль и стиль общения бота. Не показывается посетителям.</div>
        </div>
      </ContentBlock>

      <ContentBlock title="Лимиты">
        <MessageLimitControl
          messageLimit={form.messageLimit}
          planTier={form.planTier}
          onChange={(messageLimit) => patch({ messageLimit })}
        />
      </ContentBlock>

      <button type="submit" className="dash-btn dash-btn-primary">
        Сохранить изменения
      </button>
    </form>
  );
}
