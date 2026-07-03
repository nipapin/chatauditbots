"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";
import { Pill } from "@/components/dashboard/shared/Pill";

type CheckState = "idle" | "checking" | "not-found";

export function ConnectionCheck() {
  const [state, setState] = useState<CheckState>("idle");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        type="button"
        className="dash-btn"
        disabled={state === "checking"}
        onClick={() => {
          setState("checking");
          setTimeout(() => setState("not-found"), 1600);
        }}
      >
        <Icon name={state === "checking" ? "clock" : "check-circle"} size={14} />
        {state === "checking" ? "Проверяем..." : "Проверить установку"}
      </button>
      {state === "not-found" && (
        <Pill variant="warning">
          <Icon name="alert-circle" size={11} />
          Виджет пока не найден на сайте
        </Pill>
      )}
    </div>
  );
}
