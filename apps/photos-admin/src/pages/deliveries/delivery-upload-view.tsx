import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { DeliveryPhotosSection } from "@components/deliveries/delivery-photos-section";
import { FormTextInput } from "@components/forms/adapters/form-text-input";
import { deliveriesListQueryOptions } from "@lib/deliveries/list-query";
import { createDeliveryFormValues, deliveryUploadSchema } from "@lib/deliveries/upload-form";

import type { DeliverySummary } from "@lib/deliveries/types";
import type { DeliveryFormValues } from "@lib/deliveries/upload-form";

function getUploadStatus(form: ReturnType<typeof useForm<DeliveryFormValues>>) {
  const { formState } = form;

  if (formState.isSubmitting) {
    return { tone: "loading" as const, label: "Guardando entrega..." };
  }

  if (formState.isSubmitSuccessful) {
    return { tone: "success" as const, label: "Entrega creada" };
  }

  if (Object.keys(formState.errors).length > 0) {
    return { tone: "error" as const, label: "Revisa el formulario" };
  }

  if (formState.isDirty) {
    return { tone: "idle" as const, label: "Borrador sin guardar" };
  }

  return { tone: "idle" as const, label: "Completa los datos de la entrega" };
}

export function DeliveryUploadView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryUploadSchema),
    defaultValues: createDeliveryFormValues(),
  });
  const { formState, handleSubmit, watch } = form;
  const photos = watch("photos");
  const status = getUploadStatus(form);

  const onSubmit = (values: DeliveryFormValues) => {
    const delivery: DeliverySummary = {
      id: crypto.randomUUID(),
      title: values.title.trim(),
      clientName: values.clientName.trim(),
      clientEmail: values.clientEmail.trim(),
      seen: false,
      photoCount: values.photos.length,
    };

    // MOCK: inserta la entrega en la caché de la lista para reflejarla sin backend.
    // Eliminar cuando exista el POST real al endpoint de deliveries.
    queryClient.setQueryData(
      deliveriesListQueryOptions().queryKey,
      (current: DeliverySummary[] | undefined) => [delivery, ...(current ?? [])],
    );
    void navigate({ to: "/deliveries" });
  };

  return (
    <FormProvider {...form}>
      <div className="admin-page">
        <header className="admin-page-header">
          <div className="admin-kicker">Deliveries · Nueva entrega</div>
          <h2>Prepara una entrega para tu cliente.</h2>
          <p>
            Completa los datos de la entrega y adjunta el lote de imágenes. Al guardar, la entrega
            aparecerá en la lista (sin enviar nada al servidor).
          </p>
        </header>

        <form
          className="admin-editor-shell"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(onSubmit)();
          }}
        >
          <section className="admin-editor-section">
            <div className="admin-kicker">Datos de la entrega</div>
            <div className="admin-form-grid">
              <FormTextInput<DeliveryFormValues>
                label="Título"
                name="title"
                placeholder="Boda Laura & Mario"
                required
              />
            </div>
            <div className="admin-form-grid admin-form-grid--two">
              <FormTextInput<DeliveryFormValues>
                label="Nombre del cliente"
                name="clientName"
                placeholder="Laura Vidal"
                required
              />
              <FormTextInput<DeliveryFormValues>
                autocomplete="email"
                label="Email del cliente"
                name="clientEmail"
                placeholder="cliente@example.com"
                required
                type="email"
              />
            </div>
          </section>

          <DeliveryPhotosSection />

          {typeof formState.errors.photos?.message === "string" ? (
            <mc-inline-message
              message={formState.errors.photos.message}
              title="Falta el lote de imágenes"
              tone="error"
            />
          ) : null}

          <footer className="border-mc-border-visible bg-mc-background-translucent sticky bottom-0 z-2 flex flex-wrap items-center justify-between gap-4 border-t py-4 backdrop-blur-md">
            <div className="grid gap-2">
              <div className="admin-kicker">Estado</div>
              <mc-status-text label={status.label} polite tone={status.tone} />
              <p className="text-mc-text-secondary m-0">
                {photos.length} {photos.length === 1 ? "imagen" : "imágenes"} en el lote.
              </p>
            </div>
            <mc-button
              disabled={formState.isSubmitting}
              onClick={() => {
                void handleSubmit(onSubmit)();
              }}
              variant="primary"
            >
              Guardar entrega
            </mc-button>
          </footer>
        </form>
      </div>
    </FormProvider>
  );
}
