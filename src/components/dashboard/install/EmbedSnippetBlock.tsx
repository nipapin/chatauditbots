"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";

export function EmbedSnippetBlock({ botId }: { botId: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script>
  (function (w, d) {
    var s = d.createElement("script");
    s.async = true;
    s.src = "https://widget.chataudit.ru/loader.js";
    s.setAttribute("data-bot-id", "${botId}");
    d.head.appendChild(s);
  })(window, document);
</script>`;

  return (
    <div>
      <pre
        style={{
          background: "var(--dash-bg-subtle)",
          borderRadius: "var(--dash-radius-md)",
          padding: 14,
          fontSize: 12,
          lineHeight: 1.6,
          overflowX: "auto",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
        }}
      >
        <code>{snippet}</code>
      </pre>
      <button
        type="button"
        className="dash-btn"
        style={{ marginTop: 10 }}
        onClick={() => {
          navigator.clipboard.writeText(snippet);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
      >
        <Icon name={copied ? "check-circle" : "copy"} size={14} />
        {copied ? "Скопировано" : "Скопировать код"}
      </button>
    </div>
  );
}
