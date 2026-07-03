import { StatTile } from "./StatTile";

export function ReportStats({ items }: { items: { value: string | number; label: string }[] }) {
  return (
    <div className="dash-rep-stats">
      {items.map((item) => (
        <StatTile key={item.label} value={item.value} label={item.label} />
      ))}
    </div>
  );
}
