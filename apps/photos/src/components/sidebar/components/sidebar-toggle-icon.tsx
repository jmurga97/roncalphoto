interface SidebarToggleIconProps {
  isOpen: boolean;
}

export function SidebarToggleIcon({ isOpen }: SidebarToggleIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={["sidebar-toggle-icon h-5 w-5", isOpen ? "is-open" : ""].join(" ")}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line
        className="sidebar-toggle-line sidebar-toggle-line-top origin-center transition-transform duration-300 ease-out motion-reduce:transition-none"
        x1="4"
        x2="20"
        y1="6"
        y2="6"
      />
      <line
        className="sidebar-toggle-line sidebar-toggle-line-middle origin-center transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
        x1="4"
        x2="20"
        y1="12"
        y2="12"
      />
      <line
        className="sidebar-toggle-line sidebar-toggle-line-bottom origin-center transition-transform duration-300 ease-out motion-reduce:transition-none"
        x1="4"
        x2="20"
        y1="18"
        y2="18"
      />
    </svg>
  );
}
