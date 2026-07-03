import type { AnalyticsRangeDays } from "@/lib/dashboard/types";

const OPTIONS: { value: AnalyticsRangeDays; label: string }[] = [
  { value: 7, label: "7 дней" },
  { value: 30, label: "30 дней" },
  { value: 90, label: "90 дней" },
];

export function AnalyticsFilters({
  value,
  onChange,
}: {
  value: AnalyticsRangeDays;
  onChange: (value: AnalyticsRangeDays) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="dash-btn"
          style={
            value === option.value
              ? { background: "var(--dash-success-fg)", borderColor: "var(--dash-success-fg)", color: "#fff" }
              : undefined
          }
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
