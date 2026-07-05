"use client";

import { useState } from "react";
import { useBot } from "@/lib/dashboard/useBot";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { ColorSwatchPicker } from "./ColorSwatchPicker";
import { StarterPromptsEditor } from "./StarterPromptsEditor";
import { WidgetPreview } from "./WidgetPreview";
import type { WidgetConfig } from "@/lib/dashboard/types";

export function WidgetAppearanceForm({ botId }: { botId: string }) {
  const { bot, widgetConfig, data } = useBot(botId);
  const { show } = useToast();
  const [form, setForm] = useState<WidgetConfig | null>(widgetConfig ?? null);
  const [welcomeMessage, setWelcomeMessage] = useState(bot?.welcomeMessage ?? "");

  if (!bot || !form) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  const patch = (p: Partial<WidgetConfig>) => setForm((prev) => (prev ? { ...prev, ...p } : prev));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, alignItems: "start" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          data.updateWidgetConfig(botId, form);
          data.updateBot(botId, { welcomeMessage });
          show("Внешний вид виджета сохранён", "success");
        }}
      >
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
              onChange={(e) => setWelcomeMessage(e.target.value)}
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
              onChange={(e) => patch({ companyName: e.target.value })}
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
              onChange={(e) => patch({ subtitle: e.target.value })}
            />
          </div>
        </ContentBlock>

        <ContentBlock title="Цвета — светлая тема">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ColorSwatchPicker
              label="Основной цвет"
              value={form.primaryColorLight}
              onChange={(primaryColorLight) => patch({ primaryColorLight })}
            />
            <ColorSwatchPicker
              label="Пузырь бота"
              value={form.botBubbleColorLight}
              onChange={(botBubbleColorLight) => patch({ botBubbleColorLight })}
            />
            <ColorSwatchPicker
              label="Пузырь пользователя"
              value={form.userBubbleColorLight}
              onChange={(userBubbleColorLight) => patch({ userBubbleColorLight })}
            />
            <ColorSwatchPicker
              label="Фон чата"
              value={form.backgroundColorLight}
              onChange={(backgroundColorLight) => patch({ backgroundColorLight })}
            />
          </div>
        </ContentBlock>

        <ContentBlock title="Цвета — тёмная тема">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ColorSwatchPicker
              label="Основной цвет"
              value={form.primaryColorDark}
              onChange={(primaryColorDark) => patch({ primaryColorDark })}
            />
            <ColorSwatchPicker
              label="Пузырь бота"
              value={form.botBubbleColorDark}
              onChange={(botBubbleColorDark) => patch({ botBubbleColorDark })}
            />
            <ColorSwatchPicker
              label="Пузырь пользователя"
              value={form.userBubbleColorDark}
              onChange={(userBubbleColorDark) => patch({ userBubbleColorDark })}
            />
            <ColorSwatchPicker
              label="Фон чата"
              value={form.backgroundColorDark}
              onChange={(backgroundColorDark) => patch({ backgroundColorDark })}
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
              onChange={(e) => patch({ theme: e.target.value as WidgetConfig["theme"] })}
            >
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
            <div className="dash-hint">Определяет, какая из палитр выше используется в виджете.</div>
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
                onChange={(e) => patch({ position: e.target.value as WidgetConfig["position"] })}
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
                onChange={(e) => patch({ buttonSize: e.target.value as WidgetConfig["buttonSize"] })}
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
                onChange={(e) => patch({ buttonStyle: e.target.value as WidgetConfig["buttonStyle"] })}
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
          />
        </ContentBlock>

        <button type="submit" className="dash-btn dash-btn-primary">
          Сохранить внешний вид
        </button>
      </form>

      <div style={{ position: "sticky", top: 0 }}>
        <div className="dash-content-block-title">Предпросмотр</div>
        <WidgetPreview config={form} botName={bot.name} welcomeMessage={welcomeMessage} />
      </div>
    </div>
  );
}
