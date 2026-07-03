export function ColorSwatchPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="dash-field">
      <label className="dash-label">{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 34,
            height: 34,
            padding: 0,
            border: "0.5px solid var(--dash-input-border)",
            borderRadius: "var(--dash-radius-sm)",
            background: "none",
            cursor: "pointer",
          }}
        />
        <input
          className="dash-input"
          style={{ maxWidth: 120 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
