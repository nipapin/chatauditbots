type DonutTone = "good" | "med" | "low";

const TONE_COLOR: Record<DonutTone, string> = {
  good: "var(--dash-success-fg)",
  med: "var(--dash-warning-fg)",
  low: "var(--dash-danger-fg)",
};

export function Donut({
  value,
  size = 44,
  tone = "good",
  label,
}: {
  value: number;
  size?: number;
  tone?: DonutTone;
  label?: string;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circumference;

  return (
    <div className="dash-donut" style={{ width: size, height: size }}>
      <svg viewBox="0 0 44 44" style={{ width: size, height: size }}>
        <circle className="dash-donut-track" cx="22" cy="22" r={radius} />
        <circle
          className="dash-donut-fill"
          cx="22"
          cy="22"
          r={radius}
          stroke={TONE_COLOR[tone]}
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="dash-donut-num" style={{ color: TONE_COLOR[tone] }}>
        {label ?? Math.round(clamped)}
      </div>
    </div>
  );
}
