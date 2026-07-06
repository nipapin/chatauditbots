"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const DEMO_REPLY = "Это демо-ответ — на сайте здесь появится настоящий ответ ИИ-ассистента.";
const DISCLAIMER = "Отвечает AI-ассистент. Информация в чате не является публичной офертой.";
const SEED_VISITOR_MESSAGE = "Здравствуйте! Подскажите, пожалуйста...";

interface PreviewMessage {
  id: number;
  role: "visitor" | "bot";
  text: string;
  time: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/** Чёрный или белый текст поверх произвольного фона — по яркости цвета. */
function getContrastText(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#1a1a18";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1a18" : "#ffffff";
}

export function WidgetPreview({
  config,
  botName,
  welcomeMessage,
}: {
  config: WidgetConfig;
  botName: string;
  welcomeMessage: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  // Пример сообщения посетителя добавлен сразу, чтобы сразу видеть цвет
  // пузыря пользователя, не кликая по подсказкам и не отправляя своё сообщение.
  // Ленивый инициализатор — new Date() считается один раз при монтировании, а не на каждый рендер.
  const [messages, setMessages] = useState<PreviewMessage[]>(() => [
    { id: -1, role: "visitor", text: SEED_VISITOR_MESSAGE, time: formatTime(new Date()) },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, typing, interacted]);

  const resetHistory = useCallback(() => {
    setMessages([{ id: -1, role: "visitor", text: SEED_VISITOR_MESSAGE, time: formatTime(new Date()) }]);
    setDraft("");
    setTyping(false);
    setInteracted(false);
  }, []);

  const isRight = config.position === "bottom-right";
  const buttonSize = BUTTON_SIZE_PX[config.buttonSize];
  const isDark = config.theme === "dark";
  const surfaceBg = isDark ? "#1c1c1e" : "#ffffff";
  const surfaceText = isDark ? "#e8e6e0" : "#1a1a18";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  /** Цвета активной темы — у виджета отдельные палитры для светлой и тёмной темы. */
  const active = isDark
    ? {
        primaryColor: config.primaryColorDark,
        botBubbleColor: config.botBubbleColorDark,
        userBubbleColor: config.userBubbleColorDark,
        backgroundColor: config.backgroundColorDark,
      }
    : {
        primaryColor: config.primaryColorLight,
        botBubbleColor: config.botBubbleColorLight,
        userBubbleColor: config.userBubbleColorLight,
        backgroundColor: config.backgroundColorLight,
      };

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const visitorMsg: PreviewMessage = { id: Date.now(), role: "visitor", text: trimmed, time: formatTime(new Date()) };
    setMessages((prev) => [...prev, visitorMsg]);
    setDraft("");
    setInteracted(true);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: DEMO_REPLY, time: formatTime(new Date()) }]);
    }, 600);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: 560,
        borderRadius: "var(--dash-radius-lg)",
        border: "0.5px solid var(--dash-border)",
        background: "var(--dash-bg-subtle)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--dash-text-tertiary)" }}>Предпросмотр сайта клиента</span>
        <button
          type="button"
          onClick={resetHistory}
          style={{
            fontSize: 11,
            color: "var(--dash-text-tertiary)",
            background: "none",
            border: "0.5px solid var(--dash-border)",
            borderRadius: "var(--dash-radius-sm)",
            padding: "3px 8px",
            cursor: "pointer",
          }}
        >
          Сбросить историю
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: buttonSize + 26,
            [isRight ? "right" : "left"]: 16,
            width: 340,
            // Не даём окну чата вырасти выше подписи "Предпросмотр сайта клиента" —
            // сколько бы сообщений ни было, окно ограничено высотой контейнера
            // за вычетом отступа снизу (под кнопку) и места под подпись сверху.
            maxHeight: 560 - (buttonSize + 26) - 28,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
            border: `0.5px solid ${surfaceBorder}`,
            background: surfaceBg,
            display: "flex",
            flexDirection: "column",
          } as React.CSSProperties}
        >
          <div
            style={{
              background: active.primaryColor,
              color: getContrastText(active.primaryColor),
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{config.companyName || botName}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{config.subtitle || "Онлайн-чат"}</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть чат"
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                opacity: 0.85,
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          <div
            ref={messagesRef}
            style={{
              background: active.backgroundColor,
              color: surfaceText,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              flex: "1 1 auto",
              minHeight: 0,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
              <div
                style={{
                  background: active.botBubbleColor,
                  color: getContrastText(active.botBubbleColor),
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontSize: 12,
                  maxWidth: "85%",
                }}
              >
                {welcomeMessage || "Здравствуйте! Чем могу помочь?"}
              </div>
              <span style={{ fontSize: 10, opacity: 0.55 }}>{formatTime(new Date())}</span>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: m.role === "visitor" ? "flex-end" : "flex-start" }}
              >
                <div
                  style={{
                    background: m.role === "visitor" ? active.userBubbleColor : active.botBubbleColor,
                    color: getContrastText(m.role === "visitor" ? active.userBubbleColor : active.botBubbleColor),
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 12,
                    maxWidth: "85%",
                  }}
                >
                  {m.text}
                </div>
                <span style={{ fontSize: 10, opacity: 0.55 }}>{m.time}</span>
              </div>
            ))}

            {typing && (
              <div
                style={{
                  background: active.botBubbleColor,
                  color: getContrastText(active.botBubbleColor),
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontSize: 12,
                  alignSelf: "flex-start",
                  opacity: 0.7,
                }}
              >
                …
              </div>
            )}

            {!interacted && config.starterPrompts.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {config.starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    style={{
                      border: `1px solid ${active.primaryColor}`,
                      color: active.primaryColor,
                      background: "transparent",
                      borderRadius: 999,
                      padding: "5px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 6, padding: "10px 12px", borderTop: `0.5px solid ${surfaceBorder}`, flexShrink: 0 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage(draft);
              }}
              placeholder="Напишите сообщение..."
              style={{
                flex: 1,
                border: `0.5px solid ${surfaceBorder}`,
                borderRadius: 8,
                padding: "7px 10px",
                fontSize: 12,
                background: isDark ? "#141416" : "#f7f7f5",
                color: surfaceText,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => sendMessage(draft)}
              aria-label="Отправить"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                background: active.primaryColor,
                color: getContrastText(active.primaryColor),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Icon name="send" size={14} />
            </button>
          </div>

          <div
            style={{
              fontSize: 10,
              opacity: 0.55,
              textAlign: "center",
              padding: "0 12px 10px",
              color: surfaceText,
              flexShrink: 0,
            }}
          >
            {DISCLAIMER}
          </div>
        </div>
      )}

      {/* launcher button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Закрыть чат" : "Открыть чат"}
        style={{
          position: "absolute",
          bottom: 16,
          [isRight ? "right" : "left"]: 16,
          width: config.buttonStyle === "pill-with-label" ? "auto" : buttonSize,
          height: buttonSize,
          borderRadius: BUTTON_RADIUS[config.buttonStyle],
          background: active.primaryColor,
          color: getContrastText(active.primaryColor),
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: config.buttonStyle === "pill-with-label" ? "0 18px" : 0,
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        } as React.CSSProperties}
      >
        <Icon name={isOpen ? "x" : "message-circle"} size={20} color={getContrastText(active.primaryColor)} />
        {config.buttonStyle === "pill-with-label" && (
          <span style={{ fontSize: 13, fontWeight: 500 }}>Чат</span>
        )}
      </button>
    </div>
  );
}
