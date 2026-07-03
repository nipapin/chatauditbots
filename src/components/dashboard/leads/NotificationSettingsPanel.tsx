"use client";

import { useState } from "react";
import { useToast } from "@/components/dashboard/shared/Toast";
import type { NotificationSettings } from "@/lib/dashboard/types";

export function NotificationSettingsPanel({
  settings,
  onSave,
}: {
  settings: NotificationSettings;
  onSave: (patch: Partial<NotificationSettings>) => void;
}) {
  const [form, setForm] = useState(settings);
  const { show } = useToast();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
        show("Настройки уведомлений сохранены", "success");
      }}
      style={{ maxWidth: 420 }}
    >
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14 }}>
        <input
          type="checkbox"
          checked={form.emailOnNewLead}
          onChange={(e) => setForm((f) => ({ ...f, emailOnNewLead: e.target.checked }))}
        />
        Письмо на email при новой заявке
      </label>

      <div className="dash-field">
        <label className="dash-label" htmlFor="notify-email">
          Email для уведомлений
        </label>
        <input
          id="notify-email"
          className="dash-input"
          type="email"
          placeholder="you@company.ru"
          value={form.notifyEmail}
          onChange={(e) => setForm((f) => ({ ...f, notifyEmail: e.target.value }))}
        />
      </div>

      <div className="dash-field" style={{ marginBottom: 16 }}>
        <label className="dash-label" htmlFor="webhook-url">
          Webhook URL (опционально)
        </label>
        <input
          id="webhook-url"
          className="dash-input"
          placeholder="https://example.com/webhook"
          value={form.webhookUrl ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, webhookUrl: e.target.value }))}
        />
        <div className="dash-hint">Заявки будут отправляться POST-запросом на этот адрес.</div>
      </div>

      <button type="submit" className="dash-btn dash-btn-primary">
        Сохранить
      </button>
    </form>
  );
}
