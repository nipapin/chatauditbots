"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardData } from "@/lib/dashboard/DashboardDataContext";
import { useToast } from "@/components/dashboard/shared/Toast";

export function CreateBotForm() {
  const [name, setName] = useState("");
  const { createBot } = useDashboardData();
  const { show } = useToast();
  const router = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        const bot = await createBot(trimmed);
        show(`Бот «${bot.name}» создан`, "success");
        router.push(`/bots/${bot.id}/settings`);
      }}
      style={{ maxWidth: 420 }}
    >
      <div className="dash-field">
        <label className="dash-label" htmlFor="bot-name">
          Название бота
        </label>
        <input
          id="bot-name"
          className="dash-input"
          placeholder="Например, Консультант интернет-магазина"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="dash-hint">Остальные настройки — модель, промпт, внешний вид — можно задать на следующем шаге.</div>
      </div>
      <button type="submit" className="dash-btn dash-btn-primary" disabled={!name.trim()}>
        Создать и настроить
      </button>
    </form>
  );
}
