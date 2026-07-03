function SliderField({
  label,
  value,
  min,
  max,
  step,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  hint: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="dash-field">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <label className="dash-label">{label}</label>
        <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "var(--dash-text-primary)" }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--dash-success-fg)" }}
      />
      <div className="dash-hint">{hint}</div>
    </div>
  );
}

export function GenerationParamsPanel({
  temperature,
  maxTokens,
  topP,
  onChange,
}: {
  temperature: number;
  maxTokens: number;
  topP: number;
  onChange: (patch: { temperature?: number; maxTokens?: number; topP?: number }) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 20px" }}>
      <SliderField
        label="Temperature"
        value={temperature}
        min={0}
        max={1}
        step={0.05}
        hint="Выше — более разнообразные и творческие ответы (0–1 для Claude)"
        onChange={(v) => onChange({ temperature: v })}
      />
      <SliderField
        label="Max tokens"
        value={maxTokens}
        min={100}
        max={2000}
        step={50}
        hint="Максимальная длина одного ответа бота"
        onChange={(v) => onChange({ maxTokens: v })}
      />
      <SliderField
        label="Top P"
        value={topP}
        min={0}
        max={1}
        step={0.05}
        hint="Ограничивает выбор слов наиболее вероятными вариантами"
        onChange={(v) => onChange({ topP: v })}
      />
    </div>
  );
}
