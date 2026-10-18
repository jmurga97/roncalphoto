import type { Session } from "@roncal/api/router";

interface CanvasNextSessionButtonProps {
  className: string;
  layout: "inline" | "stacked";
  onOpenSession: (photoId: string) => void;
  session: Session;
}

export function CanvasNextSessionButton({ className, layout, onOpenSession, session }: CanvasNextSessionButtonProps) {
  return (
    <button
      aria-label={`Abrir siguiente sesión: ${session.title}`}
      className={`canvas-next-session ${className} sidebar-link-action`}
      onClick={() => onOpenSession(session.photos[0].id)}
      title={`Siguiente sesión: ${session.title}`}
      type="button"
    >
      {layout === "inline" ? (
        <span className="min-w-0 truncate">Siguiente sesión · {session.title}</span>
      ) : (
        <span className="flex min-w-0 flex-col gap-0.5 text-left">
          <span className="ui-kicker text-[0.62rem] leading-none">Siguiente sesión</span>
          <span className="truncate text-sm leading-tight">{session.title}</span>
        </span>
      )}
      <span aria-hidden="true" className="sidebar-link-indicator shrink-0">
        ↗
      </span>
    </button>
  );
}
