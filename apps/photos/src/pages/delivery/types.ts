export interface DeliveryPhotoViewModel {
  id: string;
  title: string;
  imageSrc: string;
  thumbnailSrc: string;
  sizeBytes: number;
}

export type DeliveryViewMode = "list" | "gallery";
