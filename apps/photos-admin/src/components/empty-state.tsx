import type { ReactNode } from "react";

export function EmptyState({ action, description, title }: { action?: ReactNode; description: string; title: string }) {
  return (
    <div className="admin-empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
