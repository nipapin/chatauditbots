import { Icon } from "@/components/dashboard/icons/Icon";

export function TechDetails({
  summary,
  items,
}: {
  summary: string;
  items: { label: string; value: string }[];
}) {
  return (
    <details className="dash-details">
      <summary>
        <span className="dash-details-icon">
          <Icon name="chevron-down" size={13} />
        </span>
        <span>{summary}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--dash-text-tertiary)" }}>
          {items.length}
        </span>
      </summary>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "2px 20px",
          padding: "12px 12px 6px",
          background: "var(--dash-bg-subtle)",
          borderRadius: "0 0 var(--dash-radius-md) var(--dash-radius-md)",
          marginTop: -6,
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              padding: "5px 0",
              fontSize: 12,
              borderBottom: "0.5px solid var(--dash-border)",
            }}
          >
            <span style={{ color: "var(--dash-text-tertiary)" }}>{item.label}</span>
            <span style={{ fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
