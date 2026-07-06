"use client";

import { useState } from "react";
import { useBot } from "@/lib/dashboard/useBot";
import { useDebouncedCallback } from "@/lib/dashboard/useDebouncedCallback";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { ColorSwatchPicker } from "./ColorSwatchPicker";
import { StarterPromptsEditor } from "./StarterPromptsEditor";
import { WidgetPreview } from "./WidgetPreview";
import type { WidgetConfig } from "@/lib/dashboard/types";

export function WidgetAppearanceForm({ botId }: { botId: string }) {
  const { bot, widgetConfig, data } = useBot(botId);
  const [form, setForm] = useState<WidgetConfig | null>(widgetConfig ?? null);
  const [welcomeMessage, setWelcomeMessage] = useState(bot?.welcomeMessage ?? "");

  const debouncedUpdateWidgetConfig = useDebouncedCallback((patch: Partial<WidgetConfig>) => {
    data.updateWidgetConfig(botId, patch);
  }, 600);
  const debouncedUpdateWelcomeMessage = useDebouncedCallback((value: string) => {
    data.updateBot(botId, { welcomeMessage: value });
  }, 600);

  if (!bot || !form) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  // Обновляет локальную форму (мгновенный предпросмотр) и сохраняет на сервер.
  const patch = (p: Partial<WidgetConfig>) => setForm((prev) => (prev ? { ...prev, ...p } : prev));
  const commit = (p: Partial<WidgetConfig>) => data.updateWidgetConfig(botId, p);

  const isLight = form.theme === "light";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, alignItems: "start" }}>
      <div>
        <ContentBlock title="Приветствие">
          <div className="dash-field" style={{ marginBottom: 0 }}>
            <label className="dash-label" htmlFor="welcome-message">
              Приветственное сообщение
            </label>
            <textarea
              id="welcome-message"
              className="dash-textarea"
              rows={2}
              value={welcomeMessage}
              onChange={(e) => {
                const value = e.target.value;
                setWelcomeMessage(value);
                debouncedUpdateWelcomeMessage(value);
              }}
            />
            <div className="dash-hint">Первое сообщение, которое посетитель видит в чате.</div>
          </div>
        </ContentBlock>

        <ContentBlock title="Брендинг">
          <div className="dash-field">
            <label className="dash-label" htmlFor="company-name">
              Название компании
            </label>
            <input
              id="company-name"
              className="dash-input"
              value={form.companyName}
              onChange={(e) => {
                const companyName = e.target.value;
                patch({ companyName });
                debouncedUpdateWidgetConfig({ companyName });
              }}
            />
          </div>
          <div className="dash-field" style={{ marginBottom: 0 }}>
            <label className="dash-label" htmlFor="subtitle">
              Подзаголовок
            </label>
            <input
              id="subtitle"
              className="dash-input"
              placeholder="Онлайн-чат"
              value={form.subtitle}
              onChange={(e) => {
                const subtitle = e.target.value;
                patch({ subtitle });
                debouncedUpdateWidgetConfig({ subtitle });
              }}
            />
          </div>
        </ContentBlock>

        <ContentBlock title="Тема оформления">
          <div className="dash-field" style={{ marginBottom: 0 }}>
            <label className="dash-label" htmlFor="theme">
              Тема виджета
            </label>
            <select
              id="theme"
              className="dash-select"
              style={{ maxWidth: 220 }}
              value={form.theme}
              onChange={(e) => {
                const theme = e.target.value as WidgetConfig["theme"];
                patch({ theme });
                commit({ theme });
              }}
            >
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
            <div className="dash-hint">Определяет, какая из палитр ниже используется в виджете.</div>
          </div>
        </ContentBlock>

        <ContentBlock title={isLight ? "Цвета — светлая тема" : "Цвета — тёмная тема"}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {isLight ? (
              <>
                <ColorSwatchPicker
                  label="Основной цвет"
                  value={form.primaryColorLight}
                  onChange={(primaryColorLight) => patch({ primaryColorLight })}
                  onCommit={(primaryColorLight) => commit({ primaryColorLight })}
                />
                <ColorSwatchPicker
                  label="Пузырь бота"
                  value={form.botBubbleColorLight}
                  onChange={(botBubbleColorLight) => patch({ botBubbleColorLight })}
                  onCommit={(botBubbleColorLight) => commit({ botBubbleColorLight })}
                />
                <ColorSwatchPicker
                  label="Пузырь пользователя"
                  value={form.userBubbleColorLight}
                  onChange={(userBubbleColorLight) => patch({ userBubbleColorLight })}
                  onCommit={(userBubbleColorLight) => commit({ userBubbleColorLight })}
                />
                <ColorSwatchPicker
                  label="Фон чата"
                  value={form.backgroundColorLight}
                  onChange={(backgroundColorLight) => patch({ backgroundColorLight })}
                  onCommit={(backgroundColorLight) => commit({ backgroundColorLight })}
                />
              </>
            ) : (
              <>
                <ColorSwatchPicker
                  label="Основной цвет"
                  value={form.primaryColorDark}
                  onChange={(primaryColorDark) => patch({ primaryColorDark })}
                  onCommit={(primaryColorDark) => commit({ primaryColorDark })}
                />
                <ColorSwatchPicker
                  label="Пузырь бота"
                  value={form.botBubbleColorDark}
                  onChange={(botBubbleColorDark) => patch({ botBubbleColorDark })}
                  onCommit={(botBubbleColorDark) => commit({ botBubbleColorDark })}
                />
                <ColorSwatchPicker
                  label="Пузырь пользователя"
                  value={form.userBubbleColorDark}
                  onChange={(userBubbleColorDark) => patch({ userBubbleColorDark })}
                  onCommit={(userBubbleColorDark) => commit({ userBubbleColorDark })}
                />
                <ColorSwatchPicker
                  label="Фон чата"
                  value={form.backgroundColorDark}
                  onChange={(backgroundColorDark) => patch({ backgroundColorDark })}
                  onCommit={(backgroundColorDark) => commit({ backgroundColorDark })}
                />
              </>
            )}
          </div>
        </ContentBlock>

        <ContentBlock title="Расположение и кнопка">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div className="dash-field">
              <label className="dash-label" htmlFor="position">
                Положение на странице
              </label>
              <select
                id="position"
                className="dash-select"
                value={form.position}
                onChange={(e) => {
                  const position = e.target.value as WidgetConfig["position"];
                  patch({ position });
                  commit({ position });
                }}
              >
                <option value="bottom-right">Снизу справа</option>
                <option value="bottom-left">Снизу слева</option>
              </select>
            </div>
            <div className="dash-field">
              <label className="dash-label" htmlFor="button-size">
                Размер кнопки
              </label>
              <select
                id="button-size"
                className="dash-select"
                value={form.buttonSize}
                onChange={(e) => {
                  const buttonSize = e.target.value as WidgetConfig["buttonSize"];
                  patch({ buttonSize });
                  commit({ buttonSize });
                }}
              >
                <option value="sm">Маленькая</option>
                <option value="md">Средняя</option>
                <option value="lg">Большая</option>
              </select>
            </div>
            <div className="dash-field">
              <label className="dash-label" htmlFor="button-style">
                Стиль кнопки
              </label>
              <select
                id="button-style"
                className="dash-select"
                value={form.buttonStyle}
                onChange={(e) => {
                  const buttonStyle = e.target.value as WidgetConfig["buttonStyle"];
                  patch({ buttonStyle });
                  commit({ buttonStyle });
                }}
              >
                <option value="round">Круглая</option>
                <option value="rounded-square">Скруглённый квадрат</option>
                <option value="pill-with-label">Пилюля с подписью</option>
              </select>
            </div>
          </div>
        </ContentBlock>

        <ContentBlock title="Подсказки">
          <StarterPromptsEditor
            prompts={form.starterPrompts}
            onChange={(starterPrompts) => patch({ starterPrompts })}
            onCommit={(starterPrompts) => commit({ starterPrompts })}
          />
        </ContentBlock>
      </div>

      <div style={{ position: "sticky", top: 0 }}>
        <div className="dash-content-block-title">Предпросмотр</div>
        <WidgetPreview config={form} botName={bot.name} welcomeMessage={welcomeMessage} />
      </div>
    </div>
  );
}
