import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  hidden = false,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  hidden?: boolean;
}) {
  return (
    <header className={hidden ? "ming-page-header ming-visually-hidden" : "ming-page-header"}>
      <div className="ming-page-header__title">
        <h1 tabIndex={-1}>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="ming-page-header__actions">{actions}</div> : null}
    </header>
  );
}
