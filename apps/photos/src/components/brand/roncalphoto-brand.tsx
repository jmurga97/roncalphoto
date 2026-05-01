import { Link } from "@tanstack/react-router";

interface RoncalPhotoBrandProps {
  className?: string;
  labelClassName?: string;
  sidebarFocusTarget?: boolean;
}

export function RoncalPhotoBrand({
  className = "inline-block rounded-sm focus-visible:outline-none",
  labelClassName = "ui-kicker",
  sidebarFocusTarget = false,
}: RoncalPhotoBrandProps) {
  return (
    <Link
      className={className}
      data-sidebar-focus-target={sidebarFocusTarget ? "true" : undefined}
      to="/"
    >
      <span className={labelClassName}>RoncalPhoto</span>
    </Link>
  );
}
