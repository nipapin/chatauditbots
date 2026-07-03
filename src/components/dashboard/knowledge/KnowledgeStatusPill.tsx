import { Icon } from "@/components/dashboard/icons/Icon";
import { Pill } from "@/components/dashboard/shared/Pill";
import type { DocStatus } from "@/lib/dashboard/types";

const CONFIG: Record<DocStatus, { label: string; variant: "success" | "warning" | "danger"; icon: string }> = {
  ready: { label: "Готово", variant: "success", icon: "check-circle" },
  processing: { label: "Обработка", variant: "warning", icon: "clock" },
  error: { label: "Ошибка", variant: "danger", icon: "alert-circle" },
};

export function KnowledgeStatusPill({ status }: { status: DocStatus }) {
  const config = CONFIG[status];
  return (
    <Pill variant={config.variant}>
      <Icon name={config.icon} size={11} />
      {config.label}
    </Pill>
  );
}
