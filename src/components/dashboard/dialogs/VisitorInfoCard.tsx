import { Icon } from "@/components/dashboard/icons/Icon";
import type { VisitorInfo } from "@/lib/dashboard/types";

export function VisitorInfoCard({ visitor }: { visitor: VisitorInfo | null }) {
  if (!visitor) {
    return (
      <div className="dash-card">
        <div className="dash-content-block-title" style={{ marginBottom: 8 }}>
          Посетитель
        </div>
        <div style={{ fontSize: 12, color: "var(--dash-text-tertiary)" }}>Данные о посетителе недоступны</div>
      </div>
    );
  }

  const rows: { icon: string; value?: string }[] = [
    { icon: "users", value: visitor.name },
    { icon: "phone", value: visitor.phone },
    { icon: "mail", value: visitor.email },
    { icon: "link", value: visitor.location },
    { icon: "code", value: visitor.pageUrl },
  ];

  return (
    <div className="dash-card">
      <div className="dash-content-block-title" style={{ marginBottom: 10 }}>
        Посетитель
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows
          .filter((row) => row.value)
          .map((row) => (
            <div key={row.icon} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <Icon name={row.icon} size={13} color="var(--dash-text-tertiary)" />
              <span>{row.value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
