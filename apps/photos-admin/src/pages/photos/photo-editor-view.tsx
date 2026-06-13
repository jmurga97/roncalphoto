import { zodResolver } from "@hookform/resolvers/zod";
import { McConfirmAction, McMediaBrowser, McResourceEditor } from "@murga.ing/components/react";
import { getErrorMessage } from "@roncal/shared";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { FormSelect } from "@components/forms/adapters/form-select";
import { FormTextInput } from "@components/forms/adapters/form-text-input";
import { FormTextarea } from "@components/forms/adapters/form-textarea";
import { invalidatePhotoData } from "@lib/api/invalidation";
import { photoUploadsService } from "@lib/api/photo-uploads/photo-uploads";
import { resolvePhotoUploadAttempt } from "@lib/api/photo-uploads/upload-attempt";
import { photosService } from "@lib/api/photos/photos";
import { photoDetailQueryOptions } from "@lib/api/photos/query-options";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";

import type { PhotoUploadAttempt } from "@lib/api/photo-uploads/upload-attempt";
import type { PhotoMutationInput } from "@lib/api/photos/photos";
import type { ApiPhoto, ApiSession } from "@roncal/shared";

const photoSchema = z.object({
  sessionId: z.string().trim().min(1, { error: "Selecciona una sesión." }),
  url: z.string().trim(),
  miniature: z.string().trim(),
  alt: z.string().trim().min(1, { error: "El alt es obligatorio." }),
  about: z.string().trim().min(1, { error: "El texto about es obligatorio." }),
  sortOrder: z
    .string()
    .trim()
    .refine((value) => /^-?\d+$/.test(value), {
      error: "El orden debe ser un número entero.",
    }),
  metadata: z.object({
    iso: z
      .string()
      .trim()
      .refine((value) => value === "" || /^-?\d+$/.test(value), {
        error: "El ISO debe ser un número entero.",
      }),
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
  const uploadAttempt = useRef<PhotoUploadAttempt | null>(null);
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const saveMutation = useMutation({
    mutationFn: ({ file, input }: { file?: File; input: PhotoMutationInput }) => {
      if (!file) {
        return photosService.createPhoto(input);
      }

      const attempt = resolvePhotoUploadAttempt(uploadAttempt.current, file, input);
      uploadAttempt.current = attempt;
      return photoUploadsService.uploadPhoto(file, input, attempt.idempotencyKey);
    },
  });

  return (
    <PhotoEditorForm
      mode="create"
      onDeleteAction={() => {
        void navigate({ to: "/photos" });
        return Promise.resolve();
      }}
      onSaveAction={async (input, file) => {
        const photo = await saveMutation.mutateAsync({ input, file });
        uploadAttempt.current = null;
        await invalidatePhotoData(queryClient);
        queryClient.setQueryData(photoDetailQueryOptions(photo.id).queryKey, photo);
        await navigate({
          to: "/photos/$id",
          params: { id: photo.id },
        });
        return photo;
      }}
      onUploadCancel={() => {
        uploadAttempt.current = null;
      }}
      savePending={saveMutation.isPending}
      sessions={sessions}
    />
  );
}

function EditPhotoEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams({ from: "/_auth/photos/$id" });
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
        await navigate({ to: "/photos" });
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

function PhotoAssetFields({
  mode,
  onUploadFileChange,
  sessionOptions,
  uploadFile,
}: {
  mode: "create" | "edit";
  onUploadFileChange: (file?: File) => void;
  sessionOptions: Array<{ id: string; label: string; description: string }>;
  uploadFile?: File;
}) {
  return (
    <section className="admin-editor-section">
      <div className="admin-kicker">Asset</div>
      {mode === "create" ? (
        <label className="admin-upload-field">
          <span>Archivo de imagen</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              onUploadFileChange(event.currentTarget.files?.[0]);
            }}
            type="file"
          />
          <small>JPEG, PNG o WebP. Máximo 25 MiB. El archivo se sube directamente a R2.</small>
        </label>
      ) : null}
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
          placeholder="https://images.roncalphoto.com/sessions/editorial-atardecer/cover.jpg"
          required={mode === "edit" || !uploadFile}
        />
        <FormTextInput<PhotoFormValues>
          label="Miniatura"
          name="miniature"
          placeholder="https://images.roncalphoto.com/sessions/editorial-atardecer/cover-thumb.jpg"
          required={mode === "edit" || !uploadFile}
        />
      </div>
    </section>
  );
}

function PhotoEditorForm({
  deletePending = false,
  initialPhoto,
  mode,
  onDeleteAction,
  onSaveAction,
  onUploadCancel,
  savePending,
  sessions,
}: {
  deletePending?: boolean;
  initialPhoto?: PhotoRecord;
  mode: "create" | "edit";
  onDeleteAction: () => Promise<void>;
  onSaveAction: (input: PhotoMutationInput, file?: File) => Promise<PhotoRecord>;
  onUploadCancel?: () => void;
  savePending: boolean;
  sessions: ApiSession[];
}) {
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File>();
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
            {mode === "create"
              ? "Sube una imagen para generar automáticamente la versión principal y la miniatura, o introduce URLs existentes."
              : "Edita URL principal, miniatura, relación con la sesión, copy y metadata técnica."}
          </p>
        </header>

        <McResourceEditor
          deleting={deletePending}
          dirty={formState.isDirty}
          onMcCancel={() => {
            clearErrors("root");

            if (mode === "create") {
              onUploadCancel?.();
              reset(toPhotoFormValues());
              setUploadFile(undefined);
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
              const input = toPhotoMutationInput(values);

              if (!uploadFile && input.url.length === 0) {
                setError("url", {
                  type: "required",
                  message: "Añade un archivo o una URL principal.",
                });
                return;
              }

              if (!uploadFile && input.miniature.length === 0) {
                setError("miniature", {
                  type: "required",
                  message: "Añade un archivo o una miniatura.",
                });
                return;
              }

              try {
                const nextPhoto = await onSaveAction(input, uploadFile);
                setUploadFile(undefined);
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
              <mc-inline-message
                message={serverError}
                title="No se pudo completar la operación"
                tone="error"
              />
            ) : null}

            <PhotoAssetFields
              mode={mode}
              onUploadFileChange={setUploadFile}
              sessionOptions={sessionOptions}
              uploadFile={uploadFile}
            />

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
              <mc-status-text
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
            <mc-status-text
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
