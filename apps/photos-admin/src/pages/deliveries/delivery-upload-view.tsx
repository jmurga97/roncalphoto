import { zodResolver } from "@hookform/resolvers/zod";
import { InlineMessage, ResourceEditor, StatusText } from "@jmurga97/components";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { DeliveryPhotosSection } from "@components/deliveries/delivery-photos-section";
import { FormTextInput } from "@components/forms/adapters/form-text-input";
import { PageHeader } from "@components/page-header";
import { deliveriesListQueryOptions } from "@lib/deliveries/list-query";
import { createDeliveryFormValues, deliveryUploadSchema } from "@lib/deliveries/upload-form";

import type { DeliverySummary } from "@lib/deliveries/types";
import type { DeliveryFormValues } from "@lib/deliveries/upload-form";

function getUploadStatus(form: ReturnType<typeof useForm<DeliveryFormValues>>) {
  const { formState } = form;

  if (formState.isSubmitting) {
    return { tone: "info" as const, label: "Guardando…" };
  }

  if (formState.isSubmitSuccessful) {
    return { tone: "success" as const, label: "Entrega creada" };
  }

  if (Object.keys(formState.errors).length > 0) {
    return { tone: "error" as const, label: "Revisa el formulario" };
  }

  if (formState.isDirty) {
    return { tone: "neutral" as const, label: "Sin guardar" };
  }

  return { tone: "neutral" as const, label: "Borrador" };
}

export function DeliveryUploadView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryUploadSchema),
    defaultValues: createDeliveryFormValues(),
  });
  const { formState, handleSubmit } = form;
  const photos = useWatch({ control: form.control, name: "photos" });
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
    queryClient.setQueryData(deliveriesListQueryOptions().queryKey, (current: DeliverySummary[] | undefined) => [
      delivery,
      ...(current ?? []),
    ]);
    void navigate({ to: "/deliveries" });
  };

  return (
    <FormProvider {...form}>
      <div className="ming-page">
        <PageHeader hidden title="Nueva entrega" description="Prepara las imágenes y los datos del cliente." />

        <ResourceEditor
          className="admin-resource-editor"
          resourceTitle="Nueva entrega"
          description="Borrador de prueba · no se guarda ni se envía al cliente"
          saveLabel="Guardar borrador"
          cancelLabel="Cancelar"
          dirty={formState.isDirty}
          saving={formState.isSubmitting}
          status={<StatusText label={status.label} tone={status.tone} aria-live="off" />}
          onSave={() => {
            void handleSubmit(onSubmit)();
          }}
          onCancel={() => {
            void navigate({ to: "/deliveries" });
          }}
          aside={
            <InlineMessage
              title="Entrega de prueba"
              message={`${photos.length} imágenes seleccionadas. El borrador solo aparecerá en esta sesión del panel; los archivos no se subirán.`}
            />
          }
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
            <InlineMessage message={formState.errors.photos.message} title="Falta el lote de imágenes" tone="error" />
          ) : null}
        </ResourceEditor>
      </div>
    </FormProvider>
  );
}
