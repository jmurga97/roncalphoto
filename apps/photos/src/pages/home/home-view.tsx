import { RoncalPhotoBrand } from "@components/brand/roncalphoto-brand";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HomeEmptyState } from "./components/home-empty-state";
import { HomeSessionCard } from "./components/home-session-card";

export function HomeView() {
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const visibleSessions = sessions.filter((session) =>
    session.photos.some(
      (photo) => photo.miniature.trim().length > 0 || photo.url.trim().length > 0,
    ),
  );

  if (visibleSessions.length === 0) {
    return <HomeEmptyState />;
  }

  return (
    <div className="gallery-enter h-full overflow-y-auto px-1 py-1 sm:px-1.5 sm:py-1.5">
      <header className="mb-10 px-1 pt-6 sm:hidden">
        <RoncalPhotoBrand />
      </header>

      <div className="mx-auto columns-1 gap-2 sm:columns-2 xl:columns-3">
        {visibleSessions.map((session) => (
          <HomeSessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
