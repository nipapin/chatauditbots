import Link from "next/link";
import { Avatar } from "@/components/dashboard/shared/Avatar";
import { Pill } from "@/components/dashboard/shared/Pill";
import { DeleteBotButton } from "./DeleteBotButton";
import { formatRelativeTime } from "@/lib/dashboard/format";
import type { Bot } from "@/lib/dashboard/types";

const STATUS_LABEL: Record<Bot["status"], string> = {
  active: "Активен",
  paused: "На паузе",
  draft: "Черновик",
};
const STATUS_VARIANT: Record<Bot["status"], "success" | "warning" | "neutral"> = {
  active: "success",
  paused: "warning",
  draft: "neutral",
};

export function BotCard({ bot, dialogCount }: { bot: Bot; dialogCount: number }) {
  return (
    <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar name={bot.name} imageUrl={bot.avatarUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={`/${bot.id}/settings`}
            style={{ fontSize: 14, fontWeight: 500, textDecoration: "none" }}
          >
            {bot.name}
          </Link>
          <div style={{ marginTop: 4 }}>
            <Pill variant={STATUS_VARIANT[bot.status]}>{STATUS_LABEL[bot.status]}</Pill>
          </div>
        </div>
        <DeleteBotButton botId={bot.id} botName={bot.name} />
      </div>

      <div style={{ fontSize: 12, color: "var(--dash-text-tertiary)" }}>
        {dialogCount} {dialogCount === 1 ? "диалог" : "диалогов"} · обновлён {formatRelativeTime(bot.updatedAt)}
      </div>

      <Link
        href={`/${bot.id}/settings`}
        className="dash-btn"
        style={{ justifyContent: "center", marginTop: "auto" }}
      >
        Открыть настройки
      </Link>
    </div>
  );
}
