import { zodResolver } from "@hookform/resolvers/zod";
import { MediaBrowser, ResourceEditor, StatusText } from "@jmurga97/components";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormSelect } from "@components/forms/adapters/form-select";
import { FormTextInput } from "@components/forms/adapters/form-text-input";
import { FormTextarea } from "@components/forms/adapters/form-textarea";
import {
  ConfirmDelete,
  getEditorStatus,
  getServerError,
  useResourceSubmit,
} from "@components/forms/resource-editor-helpers";
import { PageHeader } from "@components/page-header";
import { invalidatePortfolio, trpc } from "@lib/api/client";

import type { Photo, RouterInputs } from "@roncal/api/router";

const urlField = (error: string) => z.string().trim().pipe(z.url({ error }));

const photoSchema = z.object({
  sessionId: z.string().trim().min(1, { error: "Selecciona una sesión." }),
  url: urlField("Introduce la URL de la imagen principal."),
  miniature: urlField("Introduce la URL de la miniatura."),
  alt: z.string().trim().min(1, { error: "Escribe un texto alternativo" }),
  about: z.string().trim().min(1, { error: "Escribe una descripción" }),
  sortOrder: z
    .string()
    .trim()
    .regex(/^-?\d+$/, { error: "El orden debe ser un número entero." }),
  metadata: z.object({
    iso: z.string().trim().regex(/^\d*$/, { error: "El ISO debe ser un número entero." }),
    aperture: z.string().trim(),
    shutterSpeed: z.string().trim(),
    lens: z.string().trim(),
    camera: z.string().trim(),
  }),
});

type PhotoFormValues = z.infer<typeof photoSchema>;
type PhotoInput = RouterInputs["photos"]["update"]["data"];

function toPhotoFormValues(photo: Photo): PhotoFormValues {
  return {
    sessionId: photo.sessionId,
    url: photo.url,
    miniature: photo.miniature,
    alt: photo.alt,
    about: photo.about,
    sortOrder: String(photo.sortOrder),
    metadata: { ...photo.metadata, iso: photo.metadata.iso ? String(photo.metadata.iso) : "" },
  };
}

// Every field is sent: empty metadata strings clear the stored value.
function toPhotoInput({ sortOrder, metadata, ...values }: PhotoFormValues): PhotoInput {
  return {
    ...values,
    sortOrder: Number(sortOrder),
    metadata: { ...metadata, iso: Number(metadata.iso) || null },
  };
}

function PhotoMetadataFields() {
  return (
    <section className="admin-editor-section">
      <div className="admin-kicker">Metadata técnica</div>
      <div className="admin-form-grid admin-form-grid--two">
        <FormTextInput<PhotoFormValues> label="ISO" name="metadata.iso" optional placeholder="400" type="number" />
        <FormTextInput<PhotoFormValues> label="Apertura" name="metadata.aperture" optional placeholder="f/2.8" />
        <FormTextInput<PhotoFormValues>
          label="Velocidad de obturación"
          name="metadata.shutterSpeed"
          optional
          placeholder="1/250"
        />
        <FormTextInput<PhotoFormValues> label="Objetivo" name="metadata.lens" optional placeholder="85mm f/1.8" />
        <FormTextInput<PhotoFormValues> label="Cámara" name="metadata.camera" optional placeholder="Canon EOS R5" />
      </div>
    </section>
  );
}

export function PhotoEditorView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams({ from: "/_auth/photos/$id" });
  const { data: photo } = useSuspenseQuery(trpc.photos.get.queryOptions({ id }));
  const { data: sessions } = useSuspenseQuery(trpc.sessions.list.queryOptions());
  const saveMutation = useMutation(trpc.photos.update.mutationOptions());
  const deleteMutation = useMutation(trpc.photos.delete.mutationOptions());
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: toPhotoFormValues(photo),
  });
  const { clearErrors, formState, reset } = form;
  const [sessionId, sortOrder, url, miniature, alt, about] = useWatch({
    control: form.control,
    name: ["sessionId", "sortOrder", "url", "miniature", "alt", "about"],
  });
  const serverError = getServerError(form);
  const sessionLabel = sessions.find((session) => session.id === sessionId)?.title ?? "Sin sesión";
  const editorStatus = getEditorStatus({
    deletePending: deleteMutation.isPending,
    isDirty: formState.isDirty,
    isSubmitSuccessful: formState.isSubmitSuccessful,
    savePending: saveMutation.isPending,
    serverError,
  });
  const submitResource = useResourceSubmit<PhotoFormValues, PhotoInput, Photo>({
    form,
    onSave: async (data) => {
      const savedPhoto = await saveMutation.mutateAsync({ id: photo.id, data });
      await invalidatePortfolio();
      queryClient.setQueryData(trpc.photos.get.queryKey({ id: photo.id }), savedPhoto);
      return savedPhoto;
    },
    toFormValues: toPhotoFormValues,
    toInput: toPhotoInput,
  });

  return (
    <FormProvider {...form}>
      <div className="ming-page">
        <PageHeader hidden title={photo.alt} />

        <ResourceEditor
          className="admin-resource-editor"
          deleting={deleteMutation.isPending}
          dirty={formState.isDirty}
          onCancel={() => {
            clearErrors("root");
            reset(toPhotoFormValues(photo));
          }}
          onDelete={() => setDeleteConfirmOpen(true)}
          onSave={submitResource}
          resourceTitle={photo.alt}
          saveLabel="Guardar cambios"
          cancelLabel="Descartar cambios"
          deleteLabel="Eliminar"
          saving={saveMutation.isPending}
          status={
            <StatusText
              label={editorStatus?.label ?? "Sin cambios"}
              tone={editorStatus?.tone ?? "neutral"}
              aria-live="off"
            />
          }
          aside={
            <div className="admin-aside-stack">
              <section className="admin-editor-section">
                <div className="admin-kicker">Vista previa</div>
                <StatusText label={`${sessionLabel} · orden ${sortOrder}`} polite tone="neutral" />
              </section>
              <MediaBrowser
                emptyLabel="Añade una URL principal para ver la previsualización."
                items={
                  url.trim()
                    ? [
                        {
                          id: photo.id,
                          src: url,
                          thumbnailSrc: miniature || undefined,
                          alt: alt || "Previsualización",
                          caption: about || undefined,
                        },
                      ]
                    : []
                }
                selectedId={photo.id}
                showRail={false}
              />
              <ConfirmDelete
                title="¿Eliminar foto?"
                confirmLabel="Eliminar foto"
                message="¿Seguro que quieres borrar esta foto? Esta acción no se puede deshacer."
                onConfirm={async () => {
                  await deleteMutation.mutateAsync({ id: photo.id });
                  await invalidatePortfolio();
                  await navigate({ to: "/photos" });
                  document.querySelector("h1")?.focus();
                }}
                onOpenChange={setDeleteConfirmOpen}
                open={isDeleteConfirmOpen}
                pending={deleteMutation.isPending}
              />
            </div>
          }
        >
          <div className="admin-editor-layout">
            <section className="admin-editor-section">
              <div className="admin-kicker">Imagen</div>
              <div className="admin-form-grid admin-form-grid--two">
                <FormSelect<PhotoFormValues>
                  label="Sesión"
                  name="sessionId"
                  options={sessions.map((session) => ({
                    id: session.id,
                    label: session.title,
                    description: session.slug,
                  }))}
                  placeholder="Seleccionar sesión"
                  required
                />
                <FormTextInput<PhotoFormValues> label="Orden" name="sortOrder" placeholder="0" required type="number" />
              </div>
              <div className="admin-form-grid">
                <FormTextInput<PhotoFormValues> label="URL principal" name="url" required />
                <FormTextInput<PhotoFormValues> label="Miniatura" name="miniature" required />
              </div>
            </section>

            <section className="admin-editor-section">
              <div className="admin-kicker">Contenido</div>
              <div className="admin-form-grid">
                <FormTextInput<PhotoFormValues>
                  label="Texto alternativo"
                  name="alt"
                  placeholder="Retrato editorial a contraluz"
                  required
                />
                <FormTextarea<PhotoFormValues>
                  label="Descripción"
                  name="about"
                  placeholder="Contexto, intención, dirección o apuntes de la imagen."
                  required
                  rows={8}
                />
              </div>
            </section>

            <PhotoMetadataFields />
          </div>
        </ResourceEditor>
      </div>
    </FormProvider>
  );
}
