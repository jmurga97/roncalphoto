import { defineMcAppShell } from "./components/mc-app-shell";
import { defineMcBadge } from "./components/mc-badge";
import { defineMcButton } from "./components/mc-button";
import { defineMcCheckbox } from "./components/mc-checkbox";
import { defineMcConfirmAction } from "./components/mc-confirm-action";
import { defineMcField } from "./components/mc-field";
import { defineMcInlineMessage } from "./components/mc-inline-message";
import { defineMcInput } from "./components/mc-input";
import { defineMcMediaBrowser } from "./components/mc-media-browser";
import { defineMcNavList } from "./components/mc-nav-list";
import { defineMcOverviewPanel } from "./components/mc-overview-panel";
import { defineMcPagination } from "./components/mc-pagination";
import { defineMcRelationshipPanel } from "./components/mc-relationship-panel";
import { defineMcResourceEditor } from "./components/mc-resource-editor";
import { defineMcResourceTable } from "./components/mc-resource-table";
import { defineMcSearchField } from "./components/mc-search-field";
import { defineMcSelect } from "./components/mc-select";
import { defineMcSidebarNav } from "./components/mc-sidebar-nav";
import { defineMcStatusText } from "./components/mc-status-text";
import { defineMcTagList } from "./components/mc-tag-list";
import { defineMcTagPicker } from "./components/mc-tag-picker";
import { defineMcTextarea } from "./components/mc-textarea";
import { defineMcThumbnail } from "./components/mc-thumbnail";
import { defineMcThumbnailRail } from "./components/mc-thumbnail-rail";

export {
  defineMcAppShell,
  MC_APP_SHELL_TAG_NAME,
  McAppShell,
  type McAppShellArgs,
} from "./components/mc-app-shell";
export { defineMcBadge, MC_BADGE_TAG_NAME, McBadge, type McBadgeArgs } from "./components/mc-badge";
export {
  defineMcButton,
  MC_BUTTON_TAG_NAME,
  McButton,
  type McButtonArgs,
} from "./components/mc-button";
export {
  defineMcCheckbox,
  MC_CHECKBOX_TAG_NAME,
  McCheckbox,
  type McCheckboxArgs,
} from "./components/mc-checkbox";
export {
  defineMcConfirmAction,
  MC_CONFIRM_ACTION_TAG_NAME,
  McConfirmAction,
  type McConfirmActionArgs,
} from "./components/mc-confirm-action";
export { defineMcField, MC_FIELD_TAG_NAME, McField, type McFieldArgs } from "./components/mc-field";
export {
  defineMcInlineMessage,
  MC_INLINE_MESSAGE_TAG_NAME,
  McInlineMessage,
  type McInlineMessageArgs,
} from "./components/mc-inline-message";
export { defineMcInput, MC_INPUT_TAG_NAME, McInput, type McInputArgs } from "./components/mc-input";
export {
  defineMcMediaBrowser,
  MC_MEDIA_BROWSER_TAG_NAME,
  McMediaBrowser,
  type McMediaBrowserArgs,
} from "./components/mc-media-browser";
export {
  defineMcNavList,
  MC_NAV_LIST_TAG_NAME,
  McNavList,
  type McNavListArgs,
} from "./components/mc-nav-list";
export {
  defineMcOverviewPanel,
  MC_OVERVIEW_PANEL_TAG_NAME,
  McOverviewPanel,
  type McOverviewPanelArgs,
} from "./components/mc-overview-panel";
export {
  defineMcPagination,
  MC_PAGINATION_TAG_NAME,
  McPagination,
  type McPaginationArgs,
} from "./components/mc-pagination";
export {
  defineMcRelationshipPanel,
  MC_RELATIONSHIP_PANEL_TAG_NAME,
  McRelationshipPanel,
  type McRelationshipPanelArgs,
} from "./components/mc-relationship-panel";
export {
  defineMcResourceEditor,
  MC_RESOURCE_EDITOR_TAG_NAME,
  McResourceEditor,
  type McResourceEditorArgs,
} from "./components/mc-resource-editor";
export {
  defineMcResourceTable,
  MC_RESOURCE_TABLE_TAG_NAME,
  McResourceTable,
  type McResourceTableArgs,
} from "./components/mc-resource-table";
export {
  defineMcSearchField,
  MC_SEARCH_FIELD_TAG_NAME,
  McSearchField,
  type McSearchFieldArgs,
} from "./components/mc-search-field";
export {
  defineMcSelect,
  MC_SELECT_TAG_NAME,
  McSelect,
  type McSelectArgs,
} from "./components/mc-select";
export {
  defineMcSidebarNav,
  MC_SIDEBAR_NAV_TAG_NAME,
  McSidebarNav,
  type McSidebarNavArgs,
} from "./components/mc-sidebar-nav";
export {
  defineMcStatusText,
  MC_STATUS_TEXT_TAG_NAME,
  McStatusText,
  type McStatusTextArgs,
} from "./components/mc-status-text";
export {
  defineMcTagList,
  MC_TAG_LIST_TAG_NAME,
  McTagList,
  type McTagListArgs,
} from "./components/mc-tag-list";
export {
  defineMcTagPicker,
  MC_TAG_PICKER_TAG_NAME,
  McTagPicker,
  type McTagPickerArgs,
} from "./components/mc-tag-picker";
export {
  defineMcTextarea,
  MC_TEXTAREA_TAG_NAME,
  McTextarea,
  type McTextareaArgs,
} from "./components/mc-textarea";
export {
  defineMcThumbnail,
  MC_THUMBNAIL_TAG_NAME,
  McThumbnail,
  type McThumbnailArgs,
} from "./components/mc-thumbnail";
export {
  defineMcThumbnailRail,
  MC_THUMBNAIL_RAIL_TAG_NAME,
  McThumbnailRail,
  type McThumbnailRailArgs,
} from "./components/mc-thumbnail-rail";

export const murgaComponentRegistry = [
  "mc-app-shell",
  "mc-badge",
  "mc-button",
  "mc-checkbox",
  "mc-confirm-action",
  "mc-field",
  "mc-inline-message",
  "mc-input",
  "mc-media-browser",
  "mc-nav-list",
  "mc-overview-panel",
  "mc-pagination",
  "mc-relationship-panel",
  "mc-resource-editor",
  "mc-resource-table",
  "mc-search-field",
  "mc-select",
  "mc-sidebar-nav",
  "mc-status-text",
  "mc-tag-list",
  "mc-tag-picker",
  "mc-textarea",
  "mc-thumbnail",
  "mc-thumbnail-rail",
] as const;

export function registerMurgaComponents() {
  defineMcButton();
  defineMcInput();
  defineMcTextarea();
  defineMcSelect();
  defineMcCheckbox();
  defineMcBadge();
  defineMcStatusText();
  defineMcThumbnail();
  defineMcField();
  defineMcSearchField();
  defineMcTagList();
  defineMcTagPicker();
  defineMcInlineMessage();
  defineMcConfirmAction();
  defineMcPagination();
  defineMcNavList();
  defineMcThumbnailRail();
  defineMcAppShell();
  defineMcSidebarNav();
  defineMcOverviewPanel();
  defineMcResourceTable();
  defineMcResourceEditor();
  defineMcMediaBrowser();
  defineMcRelationshipPanel();
}
