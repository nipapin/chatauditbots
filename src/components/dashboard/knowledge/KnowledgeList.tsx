"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";
import { IconButton } from "@/components/dashboard/shared/IconButton";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Modal } from "@/components/dashboard/shared/Modal";
import { KnowledgeStatusPill } from "./KnowledgeStatusPill";
import { formatBytes, formatDate } from "@/lib/dashboard/format";
import type { DocSourceType, KnowledgeDocument } from "@/lib/dashboard/types";

const SOURCE_LABEL: Record<DocSourceType, string> = {
  file: "Файл",
  link: "Ссылка",
  text: "Текст",
};
const SOURCE_ICON: Record<DocSourceType, string> = {
  file: "book-open",
  link: "link",
  text: "edit",
};

export function KnowledgeList({
  docs,
  onDelete,
}: {
  docs: KnowledgeDocument[];
  onDelete: (docId: string) => void;
}) {
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocument | null>(null);

  if (docs.length === 0) {
    return <EmptyState title="База знаний пуста" description="Загрузите документы или добавьте ссылки на страницы сайта." />;
  }

  return (
    <>
      <table className="dash-table">
        <thead>
          <tr>
            <th>Материал</th>
            <th>Тип</th>
            <th>Размер</th>
            <th>Добавлен</th>
            <th>Статус</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => (
            <tr key={doc.id}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name={SOURCE_ICON[doc.sourceType]} size={14} color="var(--dash-text-tertiary)" />
                  <div>
                    <div>{doc.title}</div>
                    {doc.status === "error" && doc.errorMessage && (
                      <div style={{ fontSize: 11, color: "var(--dash-danger-fg)" }}>{doc.errorMessage}</div>
                    )}
                  </div>
                </div>
              </td>
              <td>{SOURCE_LABEL[doc.sourceType]}</td>
              <td>{doc.sourceType === "file" ? formatBytes(doc.sizeBytes) : "—"}</td>
              <td>{formatDate(doc.addedAt)}</td>
              <td>
                <KnowledgeStatusPill status={doc.status} />
              </td>
              <td>
                <div style={{ display: "flex", gap: 6 }}>
                  <IconButton icon="eye" label="Предпросмотр материала" onClick={() => setPreviewDoc(doc)} />
                  <IconButton icon="trash" label="Удалить материал" variant="danger" onClick={() => onDelete(doc.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {previewDoc && (
        <Modal title={previewDoc.title} onClose={() => setPreviewDoc(null)}>
          {previewDoc.content ? (
            <pre
              style={{
                background: "var(--dash-bg-subtle)",
                borderRadius: "var(--dash-radius-md)",
                padding: 14,
                fontSize: 12,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: "50vh",
                overflowY: "auto",
              }}
            >
              {previewDoc.content}
            </pre>
          ) : previewDoc.sourceType === "link" ? (
            <div style={{ fontSize: 13 }}>
              Ссылка: <a href={previewDoc.url} target="_blank" rel="noreferrer">{previewDoc.url}</a>
            </div>
          ) : (
            <div className="dash-hint">
              Предпросмотр недоступен для этого типа файла в демо-версии — доступны только название и статус.
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
