import type { ReactNode } from "react";

interface StateCardProps {
  // Actions or details below the description.
  children?: ReactNode;
  className?: string;
  description: ReactNode;
  // h1 on standalone pages (deliveries); h2 inside the layout, whose sidebar owns the h1.
  headingLevel?: "h1" | "h2";
  kicker: string;
  title: string;
}

/**
 * Centered card for empty, error and not-found states.
 */
export function StateCard({
  children,
  className = "",
  description,
  headingLevel = "h2",
  kicker,
  title,
}: StateCardProps) {
  const Heading = headingLevel;

  return (
    <div className="photo-stage flex h-full min-h-0 items-center justify-center px-8">
      <div
        className={`max-w-lg rounded-2xl border ui-divider bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-soft)] ${className}`}
      >
        <p className="ui-kicker">{kicker}</p>
        <Heading className="editorial-heading mt-2">{title}</Heading>
        <p className="ui-muted mt-3 text-sm leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  );
}
