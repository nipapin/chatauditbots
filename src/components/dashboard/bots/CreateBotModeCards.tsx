import { Icon } from "@/components/dashboard/icons/Icon";

export function CreateBotModeCards({ onSelect }: { onSelect: (mode: "ai" | "manual") => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
      <button
        type="button"
        className="dash-card"
        style={{ textAlign: "left", cursor: "pointer", width: "100%", fontFamily: "inherit" }}
        onClick={() => onSelect("ai")}
      >
        <Icon name="link" size={20} color="var(--dash-success-fg)" />
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 10 }}>Создать по сайту (ИИ)</div>
        <div style={{ fontSize: 12, color: "var(--dash-text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
          Укажите ссылку на сайт — ИИ проанализирует его и заполнит приветствие, инструкцию и оформление
          виджета автоматически.
        </div>
      </button>
      <button
        type="button"
        className="dash-card"
        style={{ textAlign: "left", cursor: "pointer", width: "100%", fontFamily: "inherit" }}
        onClick={() => onSelect("manual")}
      >
        <Icon name="edit" size={20} color="var(--dash-text-secondary)" />
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 10 }}>Заполнить вручную</div>
        <div style={{ fontSize: 12, color: "var(--dash-text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
          Дайте боту имя — остальные настройки заполните сами на следующем шаге.
        </div>
      </button>
    </div>
  );
}
