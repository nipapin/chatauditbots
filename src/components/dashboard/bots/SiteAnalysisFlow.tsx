"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icons/Icon";
import { useDashboardData } from "@/lib/dashboard/DashboardDataContext";
import { useToast } from "@/components/dashboard/shared/Toast";
import { analyzeSiteMock, fetchAiSiteCopy } from "@/lib/dashboard/siteAnalysis";

type StepStatus = "pending" | "running" | "done" | "error";
interface StepState {
  id: string;
  label: string;
  status: StepStatus;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function SiteAnalysisFlow() {
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [finished, setFinished] = useState(false);
  const [createdBotId, setCreatedBotId] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const { createBot, updateBot, updateWidgetConfig, addKnowledgeLink } = useDashboardData();
  const { show } = useToast();
  const router = useRouter();

  function setStepStatus(id: string, status: StepStatus) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || running) return;

    setRunning(true);
    setFinished(false);
    setWarning(null);

    const fallback = analyzeSiteMock(trimmed);
    const bot = createBot(fallback.name);
    setCreatedBotId(bot.id);

    setSteps([
      { id: "analyze", label: `Открываем сайт ${fallback.hostname} и пишем текст (Claude)`, status: "running" },
      { id: "knowledge", label: "Ищем каталог, FAQ, о компании и контакты", status: "pending" },
      { id: "style", label: "Подбираем цвета виджета", status: "pending" },
      { id: "done", label: "Готово", status: "pending" },
    ]);

    let aiFailed = false;
    let realColor: { primaryColor: string; accentColor: string } | null = null;
    let addedPages = 0;

    try {
      const aiCopy = await fetchAiSiteCopy(trimmed);
      updateBot(bot.id, {
        welcomeMessage: aiCopy.welcomeMessage,
        systemPrompt: aiCopy.systemPrompt,
        name: aiCopy.companyName ? `Ассистент ${aiCopy.companyName}` : fallback.name,
      });
      updateWidgetConfig(bot.id, { companyName: aiCopy.companyName || fallback.companyName });
      if (aiCopy.primaryColor && aiCopy.accentColor) {
        realColor = { primaryColor: aiCopy.primaryColor, accentColor: aiCopy.accentColor };
      }
      setStepStatus("analyze", "done");

      setStepStatus("knowledge", "running");
      await sleep(400);
      for (const page of aiCopy.discoveredPages) {
        addKnowledgeLink(bot.id, `${page.label}: ${page.title}`, page.url);
        addedPages += 1;
      }
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "knowledge"
            ? {
                ...s,
                label: addedPages
                  ? `Добавлено в базу знаний: ${addedPages} стр. (${aiCopy.discoveredPages.map((p) => p.label).join(", ")})`
                  : "Не нашли ссылок на каталог/FAQ/о компании/контакты на главной странице",
              }
            : s
        )
      );
      setStepStatus("knowledge", "done");
    } catch (err) {
      aiFailed = true;
      const message = err instanceof Error ? err.message : "Не удалось получить ответ от Claude";
      updateBot(bot.id, { welcomeMessage: fallback.welcomeMessage, systemPrompt: fallback.systemPrompt });
      setStepStatus("analyze", "error");
      setStepStatus("knowledge", "error");
      setWarning(message);
    }

    setStepStatus(
      "style",
      "running"
    );
    setSteps((prev) =>
      prev.map((s) =>
        s.id === "style"
          ? { ...s, label: realColor ? "Нашли настоящий цвет сайта (theme-color)" : "Подбираем цвета виджета" }
          : s
      )
    );
    await sleep(500);
    updateWidgetConfig(bot.id, realColor ?? { primaryColor: fallback.primaryColor, accentColor: fallback.accentColor });
    setStepStatus("style", "done");
    setStepStatus("done", "done");

    setRunning(false);
    setFinished(true);

    if (aiFailed) {
      show("Бот создан, но текст через Claude получить не удалось — использованы значения по умолчанию", "danger");
    } else {
      show(`Бот «${fallback.name}» создан по данным сайта`, "success");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ maxWidth: 420, marginBottom: steps.length > 0 ? 24 : 0 }}>
        <div className="dash-field">
          <label className="dash-label" htmlFor="site-url">
            Ссылка на сайт
          </label>
          <input
            id="site-url"
            className="dash-input"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={running}
            autoFocus
          />
          <div className="dash-hint">
            Мы откроем сайт, попросим Claude сформулировать приветствие и промпт, а также найдём на главной странице
            ссылки на каталог, FAQ, о компании и контакты — и сразу добавим их в базу знаний бота.
          </div>
        </div>
        <button type="submit" className="dash-btn dash-btn-primary" disabled={!url.trim() || running}>
          {running ? "Анализируем..." : "Проанализировать и создать бота"}
        </button>
      </form>

      {steps.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: warning || finished ? 12 : 0 }}>
          {steps.map((step) => (
            <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span className={`dash-op-dot ${step.status !== "pending" ? step.status : ""}`} />
              <span
                style={{
                  color: step.status === "pending" ? "var(--dash-text-tertiary)" : "var(--dash-text-primary)",
                }}
              >
                {step.label}
              </span>
              {step.status === "done" && <Icon name="check-circle" size={13} color="var(--dash-success-fg)" />}
              {step.status === "error" && <Icon name="alert-circle" size={13} color="var(--dash-danger-fg)" />}
            </div>
          ))}
        </div>
      )}

      {warning && (
        <div
          style={{
            fontSize: 12,
            color: "var(--dash-danger-fg)",
            background: "var(--dash-danger-bg)",
            borderRadius: "var(--dash-radius-md)",
            padding: "8px 12px",
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {warning}. Использованы стандартные приветствие и промпт — отредактируйте их в настройках бота.
        </div>
      )}

      {finished && createdBotId && (
        <button
          type="button"
          className="dash-btn dash-btn-primary"
          onClick={() => router.push(`/bots/${createdBotId}/settings`)}
        >
          Открыть настройки бота →
        </button>
      )}
    </div>
  );
}
