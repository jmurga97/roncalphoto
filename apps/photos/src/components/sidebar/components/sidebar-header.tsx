import { RoncalPhotoBrand } from "@components/brand/roncalphoto-brand";
import { RichTextRenderer } from "@utils/render-rich-text";

import { DEFAULT_DESCRIPTION_DOCUMENT } from "../constants";

export function SidebarHeader() {
  return (
    <header className="space-y-3 border-b pb-6 ui-divider">
      <RoncalPhotoBrand className="block rounded-sm focus-visible:outline-none" sidebarFocusTarget />
      <h1 className="editorial-heading mt-2">Estudio de fotografía</h1>
      <div className="editorial-prose">
        <RichTextRenderer document={DEFAULT_DESCRIPTION_DOCUMENT} />
      </div>
    </header>
  );
}
