"use client";

import { useState } from "react";
import { useDashboardData } from "@/lib/dashboard/DashboardDataContext";
import { DashboardHeader } from "@/components/dashboard/layout/DashboardHeader";
import { BotListToolbar } from "@/components/dashboard/bots/BotListToolbar";
import { BotCard } from "@/components/dashboard/bots/BotCard";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";

export default function DashboardBotListPage() {
  const { bots, dialogsByBot } = useDashboardData();
  const [query, setQuery] = useState("");

  const filtered = bots.filter((bot) => bot.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <>
      <DashboardHeader />
      <div className="dash-app">
        <div className="dash-content" style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Мои чат-боты</h1>
          <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", marginBottom: 20 }}>
            Создавайте и настраивайте чат-ботов для сайтов ваших клиентов.
          </p>

          <BotListToolbar query={query} onQueryChange={setQuery} />

          {filtered.length === 0 ? (
            <EmptyState
              icon="bot"
              title={bots.length === 0 ? "Пока нет ни одного бота" : "Ничего не найдено"}
              description={
                bots.length === 0
                  ? "Создайте первого чат-бота, чтобы начать настройку."
                  : "Попробуйте изменить поисковый запрос."
              }
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 14,
              }}
            >
              {filtered.map((bot) => (
                <BotCard key={bot.id} bot={bot} dialogCount={dialogsByBot(bot.id).length} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
