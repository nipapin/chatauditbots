"use client";

import { useState } from "react";
import { IconButton } from "@/components/dashboard/shared/IconButton";
import { ConfirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import { useDashboardData } from "@/lib/dashboard/DashboardDataContext";
import { useToast } from "@/components/dashboard/shared/Toast";

export function DeleteBotButton({ botId, botName }: { botId: string; botName: string }) {
  const [open, setOpen] = useState(false);
  const { deleteBot } = useDashboardData();
  const { show } = useToast();

  return (
    <>
      <IconButton
        icon="trash"
        label="Удалить бота"
        variant="danger"
        onClick={() => setOpen(true)}
      />
      {open && (
        <ConfirmDialog
          title="Удалить бота?"
          description={`Бот «${botName}» и все его настройки, база знаний и история диалогов будут удалены безвозвратно.`}
          onConfirm={() => {
            deleteBot(botId);
            show(`Бот «${botName}» удалён`, "success");
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
