import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import type { PopularQuestion } from "@/lib/dashboard/types";

export function PopularQuestionsList({ questions }: { questions: PopularQuestion[] }) {
  if (questions.length === 0) {
    return <EmptyState title="Пока недостаточно данных" description="Популярные вопросы появятся после первых диалогов." />;
  }

  const max = Math.max(...questions.map((q) => q.count));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {questions.map((q) => (
        <div key={q.question}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "var(--dash-text-primary)" }}>{q.question}</span>
            <span style={{ color: "var(--dash-text-tertiary)", flexShrink: 0, marginLeft: 8 }}>{q.count}</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "var(--dash-bg-subtle)" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 3,
                width: `${(q.count / max) * 100}%`,
                background: "var(--dash-info-fg)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
