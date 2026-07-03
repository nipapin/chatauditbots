"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";

export function KnowledgeUploadZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      onClick={() => inputRef.current?.click()}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: `1.5px dashed ${dragOver ? "var(--dash-success-fg)" : "var(--dash-border-strong)"}`,
        borderRadius: "var(--dash-radius-md)",
        padding: "28px 16px",
        textAlign: "center",
        cursor: "pointer",
        background: dragOver ? "var(--dash-success-bg)" : "var(--dash-bg-subtle)",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      <Icon name="upload" size={22} color="var(--dash-text-tertiary)" />
      <div style={{ marginTop: 8, fontSize: 13, color: "var(--dash-text-secondary)" }}>
        Перетащите файлы сюда или нажмите, чтобы выбрать
      </div>
      <div style={{ fontSize: 11, color: "var(--dash-text-tertiary)", marginTop: 2 }}>
        PDF, DOCX, TXT, XLSX до 20 МБ
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) onFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
