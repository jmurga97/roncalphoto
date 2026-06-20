export type DeliveryPhotoStatus = "ready" | "processing" | "failed";

export interface DeliverySummary {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  seen: boolean;
  photoCount: number;
}

export interface DeliveryDetailPhoto {
  id: string;
  title: string;
  thumbnailUrl: string;
  status: DeliveryPhotoStatus;
}
