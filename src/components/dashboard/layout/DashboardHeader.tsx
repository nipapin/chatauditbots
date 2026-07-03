"use client";

import Link from "next/link";
import { Icon } from "@/components/dashboard/icons/Icon";
import { Pill } from "@/components/dashboard/shared/Pill";
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

export function DashboardHeader({ bot }: { bot?: Bot }) {
  return (
    <div className="dash-header">
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
      >
        <Icon name="arrow-left" size={16} color="var(--dash-text-secondary)" />
        <span className="dash-header-title">ChatAudit Dashboard</span>
      </Link>
      {bot && (
        <>
          <span className="dash-header-sub">/ {bot.name}</span>
          <Pill variant={STATUS_VARIANT[bot.status]}>{STATUS_LABEL[bot.status]}</Pill>
        </>
      )}
    </div>
  );
}
