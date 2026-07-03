"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";
import { BASE_PATH } from "@/lib/basePath";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function TestChatPanel({
  systemPrompt,
  welcomeMessage,
  temperature,
  maxTokens,
}: {
  systemPrompt: string;
  welcomeMessage: string;
  temperature: number;
  maxTokens: number;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_PATH}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, temperature, maxTokens, messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка запроса");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось получить ответ");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxHeight: 320,
          overflowY: "auto",
          marginBottom: 12,
          padding: "4px 2px",
        }}
      >
        <div className="dash-msg-wrap bot">
          <div className="dash-msg-label">Бот</div>
          <div className="dash-msg-bubble bot">{welcomeMessage || "Здравствуйте! Чем могу помочь?"}</div>
        </div>
        {messages.map((m, i) => (
          <div key={i} className={`dash-msg-wrap ${m.role === "user" ? "visitor" : "bot"}`}>
            <div className="dash-msg-label">{m.role === "user" ? "Вы" : "Бот"}</div>
            <div className={`dash-msg-bubble ${m.role === "user" ? "visitor" : "bot"}`}>{m.content}</div>
          </div>
        ))}
        {sending && (
          <div className="dash-msg-wrap bot">
            <div className="dash-msg-bubble bot" style={{ color: "var(--dash-text-tertiary)" }}>
              Печатает...
            </div>
          </div>
        )}
      </div>

      {error && <div style={{ fontSize: 12, color: "var(--dash-danger-fg)", marginBottom: 8 }}>{error}</div>}

      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input
          className="dash-input"
          placeholder="Напишите сообщение боту..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="dash-btn dash-btn-primary" disabled={!input.trim() || sending}>
          <Icon name="message-circle" size={14} color="#fff" />
          Отправить
        </button>
      </form>
      <div className="dash-hint">
        Проверка использует текущие значения промпта и параметров на этой странице — даже если вы ещё не нажали
        «Сохранить изменения».
      </div>
    </div>
  );
}
