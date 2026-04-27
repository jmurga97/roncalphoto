import { SidebarErrorText } from "../sidebar-error-text";
import { SidebarHeaderContent } from "./sidebar-header-content";

export function SidebarHeaderError() {
  return (
    <SidebarHeaderContent
      bodyContent={<SidebarErrorText message="No hemos podido cargar esta sesión." />}
      tags={[]}
      title="No hemos podido cargar esta sesión."
    />
  );
}
