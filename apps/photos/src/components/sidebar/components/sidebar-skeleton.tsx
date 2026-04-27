interface SidebarSkeletonProps {
  showMetaLine?: boolean;
  showTags?: boolean;
  titleLines?: number;
}

export function SidebarSkeleton({
  showMetaLine = true,
  showTags = false,
  titleLines = 3,
}: SidebarSkeletonProps) {
  return (
    <div aria-hidden="true" className="space-y-4 animate-pulse">
      {showTags ? (
        <div className="flex flex-wrap gap-2">
          <span className="h-6 w-16 rounded-full bg-[color:var(--color-muted)]/20" />
          <span className="h-6 w-20 rounded-full bg-[color:var(--color-muted)]/20" />
          <span className="h-6 w-14 rounded-full bg-[color:var(--color-muted)]/20" />
        </div>
      ) : null}
      <div className="space-y-2">
        {Array.from({ length: titleLines }, (_, index) => (
          <div
            className={[
              "h-3 rounded-full bg-[color:var(--color-muted)]/20",
              index === titleLines - 1 ? "w-3/5" : "w-full",
            ].join(" ")}
            key={`sidebar-skeleton-line-${index + 1}`}
          />
        ))}
      </div>
      {showMetaLine ? (
        <div className="h-3 w-1/2 rounded-full bg-[color:var(--color-muted)]/20" />
      ) : null}
    </div>
  );
}
