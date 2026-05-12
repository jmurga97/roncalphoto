import { RichTextRenderer } from "@utils/render-rich-text";

import { SidebarHeaderContent } from "./sidebar-header-content";
import { DEFAULT_DESCRIPTION_DOCUMENT } from "../../constants";

export function SidebarHeaderStaticContent() {
  return (
    <SidebarHeaderContent
      bodyContent={<RichTextRenderer document={DEFAULT_DESCRIPTION_DOCUMENT} />}
      tags={[]}
      title="Inicio"
    />
  );
}
