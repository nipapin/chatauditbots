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

  if (!bot || !form) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  const patch = (p: Partial<WidgetConfig>) => setForm((prev) => (prev ? { ...prev, ...p } : prev));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          data.updateWidgetConfig(botId, form);
          show("Внешний вид виджета сохранён", "success");
        }}
      >
        <ContentBlock title="Цвета и брендинг">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <ColorSwatchPicker
              label="Основной цвет"
              value={form.primaryColor}
              onChange={(primaryColor) => patch({ primaryColor })}
            />
            <ColorSwatchPicker
              label="Акцентный цвет"
              value={form.accentColor}
              onChange={(accentColor) => patch({ accentColor })}
            />
          </div>
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
            <label className="dash-label" htmlFor="logo-upload">
              Логотип
            </label>
            <label className="dash-btn" style={{ display: "inline-flex", cursor: "pointer" }}>
              {form.logoUrl ? "Заменить файл" : "Загрузить файл"}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  patch({ logoUrl: URL.createObjectURL(file) });
                }}
              />
            </label>
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
        <WidgetPreview config={form} botName={bot.name} />
      </div>
    </div>
  );
}
