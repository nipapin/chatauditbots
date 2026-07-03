import { Pill } from "@/components/dashboard/shared/Pill";
import type { PlanTier } from "@/lib/dashboard/types";

export function MessageLimitControl({
  messageLimit,
  planTier,
  onChange,
}: {
  messageLimit: number | null;
  planTier: PlanTier;
  onChange: (value: number | null) => void;
}) {
  const canBeUnlimited = planTier !== "free";
  const isUnlimited = messageLimit === null;

  return (
    <div className="dash-field">
      <label className="dash-label">Лимит сообщений на сессию</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="number"
          className="dash-input"
          style={{ width: 120 }}
          min={1}
          disabled={isUnlimited}
          value={isUnlimited ? "" : messageLimit}
          placeholder={isUnlimited ? "—" : undefined}
          onChange={(e) => onChange(Number(e.target.value) || 1)}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: canBeUnlimited ? "var(--dash-text-secondary)" : "var(--dash-text-muted)",
            cursor: canBeUnlimited ? "pointer" : "not-allowed",
          }}
        >
          <input
            type="checkbox"
            checked={isUnlimited}
            disabled={!canBeUnlimited}
            onChange={(e) => onChange(e.target.checked ? null : 20)}
          />
          Безлимит
        </label>
        {!canBeUnlimited && <Pill variant="warning">Доступно на платном тарифе</Pill>}
      </div>
      <div className="dash-hint">Сколько сообщений посетитель может отправить в одном диалоге.</div>
    </div>
  );
}
