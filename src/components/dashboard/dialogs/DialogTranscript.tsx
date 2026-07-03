import { formatDateTime } from "@/lib/dashboard/format";
import type { DialogMessage, MessageRole } from "@/lib/dashboard/types";

const ROLE_LABEL: Record<MessageRole, string> = {
  visitor: "Посетитель",
  bot: "Бот",
  operator: "Оператор",
};

export function DialogTranscript({ messages }: { messages: DialogMessage[] }) {
  return (
    <div>
      {messages.map((message) => (
        <div key={message.id} className={`dash-msg-wrap ${message.role}`}>
          <div className="dash-msg-label">
            {ROLE_LABEL[message.role]} · {formatDateTime(message.timestamp)}
          </div>
          <div className={`dash-msg-bubble ${message.role}`}>{message.text}</div>
        </div>
      ))}
    </div>
  );
}
