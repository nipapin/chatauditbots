import { Icon } from "@/components/dashboard/icons/Icon";
import type { WidgetConfig } from "@/lib/dashboard/types";

const BUTTON_RADIUS: Record<WidgetConfig["buttonStyle"], number> = {
  round: 999,
  "rounded-square": 14,
  "pill-with-label": 22,
};
const BUTTON_SIZE_PX: Record<WidgetConfig["buttonSize"], number> = {
  sm: 44,
  md: 54,
  lg: 64,
};

export function WidgetPreview({ config, botName }: { config: WidgetConfig; botName: string }) {
  const isRight = config.position === "bottom-right";
  const buttonSize = BUTTON_SIZE_PX[config.buttonSize];

  return (
    <div
      style={{
        position: "relative",
        height: 420,
        borderRadius: "var(--dash-radius-lg)",
        border: "0.5px solid var(--dash-border)",
        background: "var(--dash-bg-subtle)",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 12, left: 12, fontSize: 11, color: "var(--dash-text-tertiary)" }}>
        Предпросмотр сайта клиента
      </div>

      {/* chat window */}
      <div
        style={{
          position: "absolute",
          bottom: buttonSize + 26,
          [isRight ? "right" : "left"]: 16,
          width: 260,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          border: "0.5px solid rgba(0,0,0,0.1)",
          background: "#ffffff",
        } as React.CSSProperties}
      >
        <div style={{ background: config.primaryColor, color: "#fff", padding: "12px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{config.companyName || botName}</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Онлайн-чат</div>
        </div>
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              background: config.accentColor,
              color: "#1a1a18",
              borderRadius: 10,
              padding: "8px 10px",
              fontSize: 12,
              alignSelf: "flex-start",
              maxWidth: "85%",
            }}
          >
            Здравствуйте! Чем могу помочь?
          </div>
          {config.starterPrompts.slice(0, 3).map((prompt) => (
            <div
              key={prompt}
              style={{
                border: `1px solid ${config.primaryColor}`,
                color: config.primaryColor,
                borderRadius: 999,
                padding: "5px 10px",
                fontSize: 11,
                alignSelf: "flex-start",
              }}
            >
              {prompt}
            </div>
          ))}
        </div>
      </div>

      {/* launcher button */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          [isRight ? "right" : "left"]: 16,
          width: config.buttonStyle === "pill-with-label" ? "auto" : buttonSize,
          height: buttonSize,
          borderRadius: BUTTON_RADIUS[config.buttonStyle],
          background: config.primaryColor,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: config.buttonStyle === "pill-with-label" ? "0 18px" : 0,
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        } as React.CSSProperties}
      >
        <Icon name="message-circle" size={20} color="#fff" />
        {config.buttonStyle === "pill-with-label" && (
          <span style={{ fontSize: 13, fontWeight: 500 }}>Чат</span>
        )}
      </div>
    </div>
  );
}
