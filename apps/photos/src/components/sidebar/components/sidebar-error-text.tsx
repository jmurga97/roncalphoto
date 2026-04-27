interface SidebarErrorTextProps {
  message: string;
}

export function SidebarErrorText({ message }: SidebarErrorTextProps) {
  return <p className="ui-muted text-sm leading-relaxed">{message}</p>;
}
