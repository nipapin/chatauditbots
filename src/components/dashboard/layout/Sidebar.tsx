"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/dashboard/icons/Icon";

const NAV_ITEMS = [
  { href: "settings", label: "Настройки", icon: "settings" },
  { href: "widget", label: "Внешний вид", icon: "palette" },
  { href: "knowledge", label: "База знаний", icon: "book-open" },
  { href: "dialogs", label: "Диалоги", icon: "message-circle" },
  { href: "analytics", label: "Аналитика", icon: "bar-chart-2" },
  { href: "leads", label: "Лиды", icon: "users" },
  { href: "install", label: "Установка", icon: "code" },
];

export function Sidebar({ botId }: { botId: string }) {
  const pathname = usePathname();
  const base = `/${botId}`;

  return (
    <div className="dash-sidebar">
      <div className="dash-sidebar-header">
        <div className="dash-sidebar-title">Настройка бота</div>
      </div>
      <nav className="dash-ops-list">
        {NAV_ITEMS.map((item) => {
          const href = `${base}/${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={item.href} href={href} className={`dash-op-item ${active ? "active" : ""}`}>
              <Icon name={item.icon} size={15} color={active ? "var(--dash-success-fg)" : "var(--dash-text-tertiary)"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
