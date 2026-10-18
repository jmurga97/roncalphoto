import { useQuery } from "@tanstack/react-query";

import { trpc } from "@lib/api/client";

import { SidebarItem } from "./sidebar-item";

export function SidebarNavigationMenu() {
  const { data: sessions } = useQuery(trpc.sessions.list.queryOptions());
  const sessionsWithPhotos = sessions?.filter((session) => session.photoCount > 0) ?? [];

  if (sessionsWithPhotos.length === 0) return null;

  return (
    <section className="pt-5">
      <header className="mb-3.5">
        <p className="ui-kicker">Navegación</p>
        <h2 className="mt-1 text-sm font-semibold uppercase tracking-[0.08em]">Sesiones</h2>
      </header>

      <ul className="ml-1 max-h-[38dvh] overflow-x-hidden overflow-y-auto p-0">
        {sessionsWithPhotos.map((session) => (
          <SidebarItem key={session.id} session={session} />
        ))}
      </ul>
    </section>
  );
}
