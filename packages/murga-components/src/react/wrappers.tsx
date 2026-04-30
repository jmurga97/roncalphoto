import type { McMediaBrowser as McMediaBrowserElement } from "../components/mc-media-browser";
import type { McNavList as McNavListElement } from "../components/mc-nav-list";
import type { McOverviewPanel as McOverviewPanelElement } from "../components/mc-overview-panel";
import type { McRelationshipPanel as McRelationshipPanelElement } from "../components/mc-relationship-panel";
import type { McResourceTable as McResourceTableElement } from "../components/mc-resource-table";
import type { McSelect as McSelectElement } from "../components/mc-select";
import type { McSidebarNav as McSidebarNavElement } from "../components/mc-sidebar-nav";
import type { McTagList as McTagListElement } from "../components/mc-tag-list";
import type { McTagPicker as McTagPickerElement } from "../components/mc-tag-picker";
import type { McThumbnailRail as McThumbnailRailElement } from "../components/mc-thumbnail-rail";
import { type ReactWrapperProps, createReactWrapper } from "./create-react-wrapper";

type OpenChangeHandler = (event: CustomEvent<{ open: boolean }>) => void;
type SelectChangeHandler = (event: CustomEvent<{ selectedId: string | null }>) => void;
type MultiSelectChangeHandler = (event: CustomEvent<{ selectedIds: string[] }>) => void;
type TagSelectHandler = (event: CustomEvent<{ itemId: string; selectedIds: string[] }>) => void;
type SimpleSelectHandler = (event: CustomEvent<{ selectedId: string }>) => void;
type SortHandler = (event: CustomEvent<{ columnId: string }>) => void;
type RowSelectHandler = (event: CustomEvent<{ selectedId: string }>) => void;

type McSelectPropertyProps = Partial<
  Pick<
    McSelectElement,
    | "options"
    | "selectedId"
    | "inputId"
    | "name"
    | "placeholder"
    | "disabled"
    | "open"
    | "ariaLabel"
  >
>;
type McSelectEventProps = {
  onMcChange?: SelectChangeHandler;
  onMcOpenChange?: OpenChangeHandler;
};
export type McSelectProps = ReactWrapperProps<
  McSelectElement,
  McSelectPropertyProps,
  McSelectEventProps
>;
export const McSelect = createReactWrapper<
  McSelectElement,
  McSelectPropertyProps,
  McSelectEventProps
>({
  tagName: "mc-select",
  propertyKeys: [
    "options",
    "selectedId",
    "inputId",
    "name",
    "placeholder",
    "disabled",
    "open",
    "ariaLabel",
  ],
  eventMap: {
    onMcChange: "mc-change",
    onMcOpenChange: "mc-open-change",
  },
});

type McTagListPropertyProps = Partial<
  Pick<McTagListElement, "items" | "selectedIds" | "interactive">
>;
type McTagListEventProps = {
  onMcSelect?: TagSelectHandler;
};
export type McTagListProps = ReactWrapperProps<
  McTagListElement,
  McTagListPropertyProps,
  McTagListEventProps
>;
export const McTagList = createReactWrapper<
  McTagListElement,
  McTagListPropertyProps,
  McTagListEventProps
>({
  tagName: "mc-tag-list",
  propertyKeys: ["items", "selectedIds", "interactive"],
  eventMap: {
    onMcSelect: "mc-select",
  },
});

type McTagPickerPropertyProps = Partial<
  Pick<McTagPickerElement, "options" | "selectedIds" | "inputId" | "disabled" | "open">
>;
type McTagPickerEventProps = {
  onMcChange?: MultiSelectChangeHandler;
  onMcOpenChange?: OpenChangeHandler;
};
export type McTagPickerProps = ReactWrapperProps<
  McTagPickerElement,
  McTagPickerPropertyProps,
  McTagPickerEventProps
>;
export const McTagPicker = createReactWrapper<
  McTagPickerElement,
  McTagPickerPropertyProps,
  McTagPickerEventProps
>({
  tagName: "mc-tag-picker",
  propertyKeys: ["options", "selectedIds", "inputId", "disabled", "open"],
  eventMap: {
    onMcChange: "mc-change",
    onMcOpenChange: "mc-open-change",
  },
});

type McNavListPropertyProps = Partial<
  Pick<McNavListElement, "items" | "ariaLabel" | "orientation">
>;
type McNavListEventProps = {
  onMcSelect?: SimpleSelectHandler;
};
export type McNavListProps = ReactWrapperProps<
  McNavListElement,
  McNavListPropertyProps,
  McNavListEventProps
>;
export const McNavList = createReactWrapper<
  McNavListElement,
  McNavListPropertyProps,
  McNavListEventProps
>({
  tagName: "mc-nav-list",
  propertyKeys: ["items", "ariaLabel", "orientation"],
  eventMap: {
    onMcSelect: "mc-select",
  },
});

type McThumbnailRailPropertyProps = Partial<
  Pick<McThumbnailRailElement, "items" | "selectedId" | "ariaLabel" | "orientation">
>;
type McThumbnailRailEventProps = {
  onMcSelect?: SimpleSelectHandler;
};
export type McThumbnailRailProps = ReactWrapperProps<
  McThumbnailRailElement,
  McThumbnailRailPropertyProps,
  McThumbnailRailEventProps
>;
export const McThumbnailRail = createReactWrapper<
  McThumbnailRailElement,
  McThumbnailRailPropertyProps,
  McThumbnailRailEventProps
>({
  tagName: "mc-thumbnail-rail",
  propertyKeys: ["items", "selectedId", "ariaLabel", "orientation"],
  eventMap: {
    onMcSelect: "mc-select",
  },
});

type McSidebarNavPropertyProps = Partial<
  Pick<McSidebarNavElement, "items" | "secondaryItems" | "open" | "title" | "subtitle">
>;
type McSidebarNavEventProps = {
  onMcSelect?: SimpleSelectHandler;
  onMcOpenChange?: OpenChangeHandler;
};
export type McSidebarNavProps = ReactWrapperProps<
  McSidebarNavElement,
  McSidebarNavPropertyProps,
  McSidebarNavEventProps
>;
export const McSidebarNav = createReactWrapper<
  McSidebarNavElement,
  McSidebarNavPropertyProps,
  McSidebarNavEventProps
>({
  tagName: "mc-sidebar-nav",
  propertyKeys: ["items", "secondaryItems", "open", "title", "subtitle"],
  eventMap: {
    onMcSelect: "mc-select",
    onMcOpenChange: "mc-open-change",
  },
});

type McOverviewPanelPropertyProps = Partial<
  Pick<McOverviewPanelElement, "title" | "description" | "stats" | "status">
>;
type McOverviewPanelEventProps = Record<string, never>;
export type McOverviewPanelProps = ReactWrapperProps<
  McOverviewPanelElement,
  McOverviewPanelPropertyProps,
  McOverviewPanelEventProps
>;
export const McOverviewPanel = createReactWrapper<
  McOverviewPanelElement,
  McOverviewPanelPropertyProps,
  McOverviewPanelEventProps
>({
  tagName: "mc-overview-panel",
  propertyKeys: ["title", "description", "stats", "status"],
  eventMap: {},
});

type McResourceTablePropertyProps = Partial<
  Pick<McResourceTableElement, "columns" | "rows" | "selectedId" | "loading" | "emptyLabel">
>;
type McResourceTableEventProps = {
  onMcRowSelect?: RowSelectHandler;
  onMcSort?: SortHandler;
};
export type McResourceTableProps = ReactWrapperProps<
  McResourceTableElement,
  McResourceTablePropertyProps,
  McResourceTableEventProps
>;
export const McResourceTable = createReactWrapper<
  McResourceTableElement,
  McResourceTablePropertyProps,
  McResourceTableEventProps
>({
  tagName: "mc-resource-table",
  propertyKeys: ["columns", "rows", "selectedId", "loading", "emptyLabel"],
  eventMap: {
    onMcRowSelect: "mc-row-select",
    onMcSort: "mc-sort",
  },
});

type McMediaBrowserPropertyProps = Partial<
  Pick<McMediaBrowserElement, "items" | "selectedId" | "showRail" | "emptyLabel">
>;
type McMediaBrowserEventProps = {
  onMcSelect?: SimpleSelectHandler;
};
export type McMediaBrowserProps = ReactWrapperProps<
  McMediaBrowserElement,
  McMediaBrowserPropertyProps,
  McMediaBrowserEventProps
>;
export const McMediaBrowser = createReactWrapper<
  McMediaBrowserElement,
  McMediaBrowserPropertyProps,
  McMediaBrowserEventProps
>({
  tagName: "mc-media-browser",
  propertyKeys: ["items", "selectedId", "showRail", "emptyLabel"],
  eventMap: {
    onMcSelect: "mc-select",
  },
});

type McRelationshipPanelPropertyProps = Partial<
  Pick<McRelationshipPanelElement, "title" | "items" | "emptyLabel">
>;
type McRelationshipPanelEventProps = {
  onMcSelect?: SimpleSelectHandler;
};
export type McRelationshipPanelProps = ReactWrapperProps<
  McRelationshipPanelElement,
  McRelationshipPanelPropertyProps,
  McRelationshipPanelEventProps
>;
export const McRelationshipPanel = createReactWrapper<
  McRelationshipPanelElement,
  McRelationshipPanelPropertyProps,
  McRelationshipPanelEventProps
>({
  tagName: "mc-relationship-panel",
  propertyKeys: ["title", "items", "emptyLabel"],
  eventMap: {
    onMcSelect: "mc-select",
  },
});
