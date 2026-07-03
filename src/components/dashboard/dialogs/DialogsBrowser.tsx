"use client";

import { useState } from "react";
import { useBot } from "@/lib/dashboard/useBot";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { DialogFilters, type DialogFilterValue } from "./DialogFilters";
import { DialogListTable } from "./DialogListTable";

export function DialogsBrowser({ botId }: { botId: string }) {
  const { bot, dialogs } = useBot(botId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DialogFilterValue>("all");

  if (!bot) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  const filtered = dialogs.filter((dialog) => {
    if (filter === "leads" && !dialog.leadCaptured) return false;
    if (filter === "no-lead" && dialog.leadCaptured) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const visitorMatch =
      dialog.visitor?.name?.toLowerCase().includes(q) ||
      dialog.visitor?.email?.toLowerCase().includes(q) ||
      dialog.visitor?.phone?.toLowerCase().includes(q);
    const messageMatch = dialog.messages.some((m) => m.text.toLowerCase().includes(q));
    return Boolean(visitorMatch || messageMatch);
  });

  return (
    <>
      <DialogFilters query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} />
      <DialogListTable botId={botId} dialogs={filtered} />
    </>
  );
}
