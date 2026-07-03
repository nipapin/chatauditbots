export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const peakIndex = data.reduce(
    (best, d, i) => (d.value > data[best].value ? i : best),
    0
  );

  return (
    <div className="dash-wd-chart">
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`} className="dash-wd-col">
          <div className="dash-wd-pct">{d.value}</div>
          <div
            className={`dash-wd-bar ${i === peakIndex && d.value > 0 ? "dash-wd-bar-peak" : ""}`}
            style={{ height: `${Math.max(4, (d.value / max) * 70)}px` }}
          />
          <div className="dash-wd-day">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
