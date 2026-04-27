import { RichTextRenderer } from "@utils/render-rich-text";
import { DEFAULT_DESCRIPTION_DOCUMENT } from "../../constants";
import { SidebarHeaderContent } from "./sidebar-header-content";

export function SidebarHeaderStaticContent() {
  return (
    <SidebarHeaderContent
      bodyContent={<RichTextRenderer document={DEFAULT_DESCRIPTION_DOCUMENT} />}
      tags={[]}
      title="Inicio"
    />
  );
}
