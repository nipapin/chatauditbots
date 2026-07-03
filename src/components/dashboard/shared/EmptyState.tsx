import { Icon } from "@/components/dashboard/icons/Icon";

export function EmptyState({
  icon = "info-row",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="dash-info-row">
      <Icon name={icon === "info-row" ? "alert-circle" : icon} size={22} color="var(--dash-text-tertiary)" />
      <div style={{ fontWeight: 500, color: "var(--dash-text-secondary)" }}>{title}</div>
      {description && <div style={{ maxWidth: 360 }}>{description}</div>}
      {action}
    </div>
  );
}
