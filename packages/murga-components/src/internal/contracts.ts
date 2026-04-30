export type McStatusTone = "idle" | "loading" | "success" | "error";

export type McBadgeTone = "default" | "accent" | "success" | "warning" | "error";

export type McOrientation = "horizontal" | "vertical";

export type McButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export type McButtonSize = "sm" | "md";

export type McThumbnailRatio = "square" | "landscape" | "portrait";

export interface McOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface McNavItem {
  id: string;
  label: string;
  description?: string;
  current?: boolean;
  count?: number;
}

export interface McTagItem {
  id: string;
  label: string;
  selected?: boolean;
}

export interface McMediaItem {
  id: string;
  src: string;
  thumbnailSrc?: string;
  alt: string;
  caption?: string;
}

export interface McStatItem {
  id: string;
  label: string;
  value: string;
  status?: McStatusTone;
}

export interface McTableColumn {
  id: string;
  label: string;
  align?: "start" | "center" | "end";
  width?: string;
  sortable?: boolean;
}

export interface McTableRow {
  id: string;
  cells: Record<string, string | number>;
  selected?: boolean;
}

export interface McInlineStatus {
  tone: McStatusTone;
  label: string;
}

export interface McBooleanDetail {
  open: boolean;
}

export interface McChangeDetail<TValue> {
  value: TValue;
}

export interface McSelectDetail {
  selectedId: string | null;
}

export interface McMultiSelectDetail {
  selectedIds: string[];
}

export interface McTagSelectDetail extends McMultiSelectDetail {
  itemId: string;
}

export interface McPageChangeDetail {
  page: number;
}

export interface McRowSelectDetail {
  selectedId: string;
}

export interface McSortDetail {
  columnId: string;
}

export interface McActionDetail {
  action: "save" | "cancel" | "delete";
}
