import type { ReactNode } from "react";

export function EmptyState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="admin-empty-state">
      <div className="admin-state-eyebrow">Vacío</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
