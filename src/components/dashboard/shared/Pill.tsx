type PillVariant = "success" | "danger" | "warning" | "info" | "neutral";

export function Pill({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: PillVariant;
}) {
  return <span className={`dash-pill dash-pill-${variant}`}>{children}</span>;
}
