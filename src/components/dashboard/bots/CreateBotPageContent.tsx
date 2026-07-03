"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";
import { CreateBotModeCards } from "./CreateBotModeCards";
import { CreateBotForm } from "./CreateBotForm";
import { SiteAnalysisFlow } from "./SiteAnalysisFlow";

type Mode = "choose" | "ai" | "manual";

const TITLES: Record<Mode, string> = {
  choose: "Как создать бота?",
  ai: "Создание по сайту",
  manual: "Новый бот вручную",
};

export function CreateBotPageContent() {
  const [mode, setMode] = useState<Mode>("choose");

  return (
    <>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{TITLES[mode]}</h1>

      {mode === "choose" ? (
        <>
          <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", marginBottom: 20 }}>
            Заполнить настройки автоматически по вашему сайту или указать их самостоятельно.
          </p>
          <CreateBotModeCards onSelect={setMode} />
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setMode("choose")}
            className="dash-btn"
            style={{ marginBottom: 20 }}
          >
            <Icon name="arrow-left" size={13} />
            Назад к выбору
          </button>
          {mode === "ai" ? <SiteAnalysisFlow /> : <CreateBotForm />}
        </>
      )}
    </>
  );
}
