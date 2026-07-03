export function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="dash-rep-stat">
      <div className="dash-rep-stat-val">{value}</div>
      <div className="dash-rep-stat-lbl">{label}</div>
    </div>
  );
}
