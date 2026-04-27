import { SidebarErrorText } from "../sidebar-error-text";

export function SidebarRelatedSectionError() {
  return (
    <section className="mt-6 border-t py-6 ui-divider">
      <SidebarErrorText message="No hemos podido cargar las sesiones relacionadas." />
    </section>
  );
}
