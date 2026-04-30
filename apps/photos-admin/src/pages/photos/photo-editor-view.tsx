import { FormSelect } from "@components/forms/adapters/form-select";
import { FormTextInput } from "@components/forms/adapters/form-text-input";
import { FormTextarea } from "@components/forms/adapters/form-textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { invalidatePhotoData } from "@lib/api/invalidation";
import { type PhotoMutationInput, photosService } from "@lib/api/photos/photos";
import { photoDetailQueryOptions } from "@lib/api/photos/query-options";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { getErrorMessage } from "@lib/http-client";
import {
  McConfirmAction,
  McInlineMessage,
  McMediaBrowser,
  McResourceEditor,
  McStatusText,
} from "@murga/components/react";
import type { ApiPhoto, ApiSession } from "@roncal/shared";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const photoSchema = z.object({
  sessionId: z.string().trim().min(1, "Selecciona una sesión."),
  url: z.string().trim().min(1, "La URL principal es obligatoria."),
  miniature: z.string().trim().min(1, "La miniatura es obligatoria."),
  alt: z.string().trim().min(1, "El alt es obligatorio."),
  about: z.string().trim().min(1, "El texto about es obligatorio."),
  sortOrder: z
    .string()
    .trim()
    .refine((value) => /^-?\d+$/.test(value), "El orden debe ser un número entero."),
  metadata: z.object({
    iso: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^-?\d+$/.test(value),
        "El ISO debe ser un número entero.",
      ),
    aperture: z.string().trim(),
    shutterSpeed: z.string().trim(),
    lens: z.string().trim(),
    camera: z.string().trim(),
  }),
});

type PhotoFormValues = z.infer<typeof photoSchema>;
type PhotoRecord = ApiPhoto;

function toOptionalText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function toOptionalNumber(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? Number(trimmedValue) : undefined;
}

function toPhotoFormValues(photo?: PhotoRecord): PhotoFormValues {
  return {
    sessionId: photo?.sessionId ?? "",
    url: photo?.url ?? "",
    miniature: photo?.miniature ?? "",
    alt: photo?.alt ?? "",
    about: photo?.about ?? "",
    sortOrder: String(photo?.sortOrder ?? 0),
    metadata: {
      iso: photo?.metadata.iso ? String(photo.metadata.iso) : "",
      aperture: photo?.metadata.aperture ?? "",
      shutterSpeed: photo?.metadata.shutterSpeed ?? "",
      lens: photo?.metadata.lens ?? "",
      camera: photo?.metadata.camera ?? "",
    },
  };
}

function toPhotoMutationInput(values: PhotoFormValues): PhotoMutationInput {
  return {
    sessionId: values.sessionId,
    url: values.url.trim(),
    miniature: values.miniature.trim(),
    alt: values.alt.trim(),
    about: values.about.trim(),
    sortOrder: Number(values.sortOrder),
    metadata: {
      iso: toOptionalNumber(values.metadata.iso),
      aperture: toOptionalText(values.metadata.aperture),
      shutterSpeed: toOptionalText(values.metadata.shutterSpeed),
      lens: toOptionalText(values.metadata.lens),
      camera: toOptionalText(values.metadata.camera),
    },
  };
}

function CreatePhotoEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const saveMutation = useMutation({
    mutationFn: photosService.createPhoto,
  });

  return (
    <PhotoEditorForm
      mode="create"
      onDeleteAction={async () => {
        navigate({ to: "/photos", search: { page: 1 } });
      }}
      onSaveAction={async (input) => {
        const photo = await saveMutation.mutateAsync(input);
        await invalidatePhotoData(queryClient);
        queryClient.setQueryData(photoDetailQueryOptions(photo.id).queryKey, photo);
        navigate({
          to: "/photos/$id",
          params: { id: photo.id },
          search: { page: 1 },
        });
        return photo;
      }}
      savePending={saveMutation.isPending}
      sessions={sessions}
    />
  );
}

function EditPhotoEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams({ from: "/_app/photos/$id" });
  const { data: photo } = useSuspenseQuery(photoDetailQueryOptions(params.id));
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const saveMutation = useMutation({
    mutationFn: (input: PhotoMutationInput) => photosService.updatePhoto(photo.id, input),
  });
  const deleteMutation = useMutation({
    mutationFn: () => photosService.deletePhoto(photo.id),
  });

  return (
    <PhotoEditorForm
      initialPhoto={photo}
      mode="edit"
      onDeleteAction={async () => {
        await deleteMutation.mutateAsync();
        await invalidatePhotoData(queryClient);
        navigate({ to: "/photos", search: { page: 1 } });
      }}
      onSaveAction={async (input) => {
        const nextPhoto = await saveMutation.mutateAsync(input);
        await invalidatePhotoData(queryClient);
        queryClient.setQueryData(photoDetailQueryOptions(nextPhoto.id).queryKey, nextPhoto);
        return nextPhoto;
      }}
      savePending={saveMutation.isPending}
      deletePending={deleteMutation.isPending}
      sessions={sessions}
    />
  );
}

function PhotoEditorForm({
  deletePending = false,
  initialPhoto,
  mode,
  onDeleteAction,
  onSaveAction,
  savePending,
  sessions,
}: {
  deletePending?: boolean;
  initialPhoto?: PhotoRecord;
  mode: "create" | "edit";
  onDeleteAction: () => Promise<void>;
  onSaveAction: (input: PhotoMutationInput) => Promise<PhotoRecord>;
  savePending: boolean;
  sessions: ApiSession[];
}) {
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: toPhotoFormValues(initialPhoto),
  });
  const { clearErrors, formState, handleSubmit, reset, setError, watch } = form;
  const watchedValues = watch();
  const serverError =
    typeof formState.errors.root?.server?.message === "string"
      ? formState.errors.root.server.message
      : undefined;
  const sessionOptions = sessions.map((session) => ({
    id: session.id,
    label: session.title,
    description: session.slug,
  }));
  const sessionLabel =
    sessions.find((session) => session.id === watchedValues.sessionId)?.title ?? "Sin sesión";
  const editorStatus = deletePending
    ? { tone: "loading" as const, label: "Eliminando foto..." }
    : savePending
      ? { tone: "loading" as const, label: "Guardando foto..." }
      : serverError
        ? { tone: "error" as const, label: "Revisa el formulario" }
        : formState.isSubmitSuccessful
          ? { tone: "success" as const, label: "Cambios guardados" }
          : formState.isDirty
            ? { tone: "idle" as const, label: "Hay cambios sin guardar" }
            : null;

  return (
    <FormProvider {...form}>
      <div className="admin-page">
        <header className="admin-page-header">
          <div className="admin-kicker">Photos</div>
          <h2>{mode === "create" ? "Nueva foto" : (initialPhoto?.alt ?? "Editar foto")}</h2>
          <p>
            Edita URL principal, miniatura, relación con la sesión, copy y metadata técnica sin
            necesidad de upload en esta primera versión.
          </p>
        </header>

        <McResourceEditor
          deleting={deletePending}
          dirty={formState.isDirty}
          onMcCancel={() => {
            clearErrors("root");

            if (mode === "create") {
              reset(toPhotoFormValues());
              return;
            }

            reset(toPhotoFormValues(initialPhoto));
          }}
          onMcDelete={() => {
            setDeleteConfirmOpen(true);
          }}
          onMcSave={() => {
            void handleSubmit(async (values) => {
              clearErrors("root");

              try {
                const nextPhoto = await onSaveAction(toPhotoMutationInput(values));
                reset(toPhotoFormValues(nextPhoto));
              } catch (error) {
                setError("root.server", {
                  type: "server",
                  message: getErrorMessage(error),
                });
              }
            })();
          }}
          resourceTitle={mode === "create" ? "Photo draft" : (initialPhoto?.id ?? "Photo")}
          saving={savePending}
          status={editorStatus}
        >
          <div slot="fields" className="admin-editor-layout">
            {serverError ? (
              <McInlineMessage
                message={serverError}
                title="No se pudo completar la operación"
                tone="error"
              />
            ) : null}

            <section className="admin-editor-section">
              <div className="admin-kicker">Asset</div>
              <div className="admin-form-grid admin-form-grid--two">
                <FormSelect<PhotoFormValues>
                  label="Sesión"
                  name="sessionId"
                  options={sessionOptions}
                  placeholder="[SELECT SESSION]"
                  required
                />
                <FormTextInput<PhotoFormValues>
                  label="Orden"
                  name="sortOrder"
                  placeholder="0"
                  required
                  type="number"
                />
              </div>
              <div className="admin-form-grid">
                <FormTextInput<PhotoFormValues>
                  label="URL principal"
                  name="url"
                  placeholder="https://cdn.example.com/photo.jpg"
                  required
                />
                <FormTextInput<PhotoFormValues>
                  label="Miniatura"
                  name="miniature"
                  placeholder="https://cdn.example.com/photo-thumb.jpg"
                  required
                />
              </div>
            </section>

            <section className="admin-editor-section">
              <div className="admin-kicker">Copy</div>
              <div className="admin-form-grid">
                <FormTextInput<PhotoFormValues>
                  label="Alt"
                  name="alt"
                  placeholder="Retrato editorial a contraluz"
                  required
                />
                <FormTextarea<PhotoFormValues>
                  label="About"
                  name="about"
                  placeholder="Contexto, intención, dirección o apuntes de la imagen."
                  required
                  rows={8}
                />
              </div>
            </section>

            <section className="admin-editor-section">
              <div className="admin-kicker">Metadata técnica</div>
              <div className="admin-form-grid admin-form-grid--two">
                <FormTextInput<PhotoFormValues>
                  label="ISO"
                  name="metadata.iso"
                  optional
                  placeholder="400"
                  type="number"
                />
                <FormTextInput<PhotoFormValues>
                  label="Apertura"
                  name="metadata.aperture"
                  optional
                  placeholder="f/2.8"
                />
                <FormTextInput<PhotoFormValues>
                  label="Shutter speed"
                  name="metadata.shutterSpeed"
                  optional
                  placeholder="1/250"
                />
                <FormTextInput<PhotoFormValues>
                  label="Lens"
                  name="metadata.lens"
                  optional
                  placeholder="85mm f/1.8"
                />
                <FormTextInput<PhotoFormValues>
                  label="Camera"
                  name="metadata.camera"
                  optional
                  placeholder="Canon EOS R5"
                />
              </div>
            </section>
          </div>

          <div slot="aside" className="admin-aside-stack">
            <section className="admin-editor-section">
              <div className="admin-kicker">Preview lateral</div>
              <McStatusText
                label={`${sessionLabel} · orden ${watchedValues.sortOrder}`}
                polite
                tone="idle"
              />
            </section>

            <McMediaBrowser
              emptyLabel="Añade una URL principal para ver la previsualización."
              items={
                watchedValues.url.trim().length > 0
                  ? [
                      {
                        id: initialPhoto?.id ?? "preview",
                        src: watchedValues.url,
                        thumbnailSrc: watchedValues.miniature || undefined,
                        alt: watchedValues.alt || "Previsualización",
                        caption: watchedValues.about || undefined,
                      },
                    ]
                  : []
              }
              selectedId={initialPhoto?.id ?? "preview"}
              showRail={false}
            />

            <McConfirmAction
              message={
                mode === "create"
                  ? "¿Quieres descartar este borrador de foto?"
                  : "¿Seguro que quieres borrar esta foto? La eliminación es persistente."
              }
              onMcCancel={() => {
                setDeleteConfirmOpen(false);
              }}
              onMcConfirm={() => {
                void (async () => {
                  try {
                    await onDeleteAction();
                  } catch (error) {
                    setDeleteConfirmOpen(false);
                    setError("root.server", {
                      type: "server",
                      message: getErrorMessage(error),
                    });
                  }
                })();
              }}
              open={isDeleteConfirmOpen}
              pending={deletePending}
            />
          </div>

          <div slot="actions">
            <McStatusText
              label={
                serverError ??
                (formState.isDirty ? "Hay cambios pendientes" : "Todo sincronizado con la foto")
              }
              polite
              tone={serverError ? "error" : formState.isDirty ? "loading" : "success"}
            />
          </div>
        </McResourceEditor>
      </div>
    </FormProvider>
  );
}

export function PhotoEditorView({ mode }: { mode: "create" | "edit" }) {
  return mode === "create" ? <CreatePhotoEditor /> : <EditPhotoEditor />;
}
