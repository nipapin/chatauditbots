import { Icon } from "@/components/dashboard/icons/Icon";
import { IconButton } from "@/components/dashboard/shared/IconButton";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { KnowledgeStatusPill } from "./KnowledgeStatusPill";
import { formatBytes, formatDate } from "@/lib/dashboard/format";
import type { KnowledgeDocument } from "@/lib/dashboard/types";

export function KnowledgeList({
  docs,
  onDelete,
}: {
  docs: KnowledgeDocument[];
  onDelete: (docId: string) => void;
}) {
  if (docs.length === 0) {
    return <EmptyState title="База знаний пуста" description="Загрузите документы или добавьте ссылки на страницы сайта." />;
  }

  return (
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
                <Icon name={doc.sourceType === "file" ? "book-open" : "link"} size={14} color="var(--dash-text-tertiary)" />
                <div>
                  <div>{doc.title}</div>
                  {doc.status === "error" && doc.errorMessage && (
                    <div style={{ fontSize: 11, color: "var(--dash-danger-fg)" }}>{doc.errorMessage}</div>
                  )}
                </div>
              </div>
            </td>
            <td>{doc.sourceType === "file" ? "Файл" : "Ссылка"}</td>
            <td>{doc.sourceType === "file" ? formatBytes(doc.sizeBytes) : "—"}</td>
            <td>{formatDate(doc.addedAt)}</td>
            <td>
              <KnowledgeStatusPill status={doc.status} />
            </td>
            <td>
              <IconButton icon="trash" label="Удалить материал" variant="danger" onClick={() => onDelete(doc.id)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
