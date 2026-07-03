import { Icon } from "@/components/dashboard/icons/Icon";

export function IconButton({
  icon,
  label,
  onClick,
  variant = "default",
  type = "button",
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`dash-btn ${variant === "danger" ? "dash-btn-danger" : ""}`}
      style={{ width: 34, padding: 0 }}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}
