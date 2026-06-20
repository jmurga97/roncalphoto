import { z } from "zod";

export const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

const deliveryPhotoSchema = z.object({
  id: z.string(),
  previewUrl: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  title: z.string().trim().min(1, { error: "El título es obligatorio." }),
  date: z.string().trim().min(1, { error: "La fecha es obligatoria." }),
});

export const deliveryUploadSchema = z.object({
  title: z.string().trim().min(1, { error: "El título de la entrega es obligatorio." }),
  clientName: z.string().trim().min(1, { error: "El nombre del cliente es obligatorio." }),
  clientEmail: z
    .string()
    .trim()
    .min(1, { error: "El email del cliente es obligatorio." })
    .pipe(z.email({ error: "Introduce un email válido." })),
  photos: z.array(deliveryPhotoSchema).min(1, { error: "Añade al menos una imagen al lote." }),
});

export type DeliveryFormValues = z.infer<typeof deliveryUploadSchema>;
export type DeliveryPhotoFormValue = z.infer<typeof deliveryPhotoSchema>;

export function createDeliveryFormValues(): DeliveryFormValues {
  return {
    title: "",
    clientName: "",
    clientEmail: "",
    photos: [],
  };
}
