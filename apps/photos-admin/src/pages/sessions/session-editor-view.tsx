import { zodResolver } from "@hookform/resolvers/zod";
import { McRelationshipPanel, McResourceEditor, McTagList } from "@murga.ing/components/react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { FormTagPicker } from "@components/forms/adapters/form-tag-picker";
import { FormTextInput } from "@components/forms/adapters/form-text-input";
import { FormTextarea } from "@components/forms/adapters/form-textarea";
import {
  ConfirmDelete,
  ServerErrorMessage,
  getEditorStatus,
  getServerError,
  useResourceSubmit,
} from "@components/forms/resource-editor-helpers";
import { invalidateSessionData } from "@lib/api/invalidation";
import { sessionDetailQueryOptions } from "@lib/api/sessions/query-options";
import { sessionsService } from "@lib/api/sessions/sessions";
import { tagsListQueryOptions } from "@lib/api/tags/query-options";

import type { SessionMutationInput } from "@lib/api/sessions/sessions";
import type { ApiSession, Tag } from "@roncal/shared";

const sessionSchema = z.object({
  title: z.string().trim().min(1, { error: "El título es obligatorio." }),
  slug: z.string().trim(),
  description: z.string().trim().min(1, { error: "La descripción es obligatoria." }),
  tagIds: z.array(z.string()).min(1, { error: "Selecciona al menos un tag." }),
});

type SessionFormValues = z.infer<typeof sessionSchema>;
type SessionRecord = ApiSession;

function toOptionalText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function toSessionFormValues(session?: SessionRecord): SessionFormValues {
  return {
    title: session?.title ?? "",
    slug: session?.slug ?? "",
    description: session?.description ?? "",
    tagIds: session?.tags.map((tag) => tag.id) ?? [],
  };
}

function toSessionMutationInput(values: SessionFormValues): SessionMutationInput {
  return {
    title: values.title.trim(),
    slug: toOptionalText(values.slug),
    description: values.description.trim(),
    tagIds: values.tagIds,
  };
}

function CreateSessionEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: tags } = useSuspenseQuery(tagsListQueryOptions());
  const saveMutation = useMutation({
    mutationFn: (input: SessionMutationInput) => sessionsService.createSession(input),
  });

  return (
    <SessionEditorForm
      mode="create"
      onCancelAction={() => {
        void navigate({ to: "/sessions" });
      }}
      onDeleteAction={() => {
        void navigate({ to: "/sessions" });
        return Promise.resolve();
      }}
      onSaveAction={async (input) => {
        const session = await saveMutation.mutateAsync(input);
        await invalidateSessionData(queryClient);
        queryClient.setQueryData(sessionDetailQueryOptions(session.slug).queryKey, session);
        await navigate({
          to: "/sessions/$slug",
          params: { slug: session.slug },
        });
        return session;
      }}
      savePending={saveMutation.isPending}
      tags={tags}
    />
  );
}

function EditSessionEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams({ from: "/_auth/sessions/$slug" });
  const { data: session } = useSuspenseQuery(sessionDetailQueryOptions(params.slug));
  const { data: tags } = useSuspenseQuery(tagsListQueryOptions());
  const saveMutation = useMutation({
    mutationFn: (input: SessionMutationInput) => sessionsService.updateSession(session.slug, input),
  });
  const deleteMutation = useMutation({
    mutationFn: () => sessionsService.deleteSession(session.slug),
  });

  return (
    <SessionEditorForm
      initialSession={session}
      mode="edit"
      onDeleteAction={async () => {
        await deleteMutation.mutateAsync();
        await invalidateSessionData(queryClient);
        await navigate({ to: "/sessions" });
      }}
      onSaveAction={async (input) => {
        const nextSession = await saveMutation.mutateAsync(input);
        await invalidateSessionData(queryClient);
        queryClient.setQueryData(sessionDetailQueryOptions(nextSession.slug).queryKey, nextSession);

        if (nextSession.slug !== session.slug) {
          await navigate({
            to: "/sessions/$slug",
            params: { slug: nextSession.slug },
          });
        }

        return nextSession;
      }}
      savePending={saveMutation.isPending}
      deletePending={deleteMutation.isPending}
      tags={tags}
    />
  );
}

function SessionEditorForm({
  deletePending = false,
  initialSession,
  mode,
  onCancelAction,
  onDeleteAction,
  onSaveAction,
  savePending,
  tags,
}: {
  deletePending?: boolean;
  initialSession?: SessionRecord;
  mode: "create" | "edit";
  onCancelAction?: () => void;
  onDeleteAction: () => Promise<void>;
  onSaveAction: (input: SessionMutationInput) => Promise<SessionRecord>;
  savePending: boolean;
  tags: Tag[];
}) {
  const navigate = useNavigate();
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: toSessionFormValues(initialSession),
  });
  const { clearErrors, formState, reset, setError, watch } = form;
  const selectedTagIds = watch("tagIds");
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const serverError = getServerError(form);
  const editorStatus = getEditorStatus({
    deletePending,
    isDirty: formState.isDirty,
    isSubmitSuccessful: formState.isSubmitSuccessful,
    labels: {
      deletingLabel: "Eliminando sesión...",
      dirtyLabel: "Hay cambios sin guardar",
      savedLabel: "Cambios guardados",
      savingLabel: "Guardando sesión...",
    },
    savePending,
    serverError,
  });
  const submitResource = useResourceSubmit<SessionFormValues, SessionMutationInput, SessionRecord>({
    form,
    onSave: onSaveAction,
    toFormValues: toSessionFormValues,
    toInput: toSessionMutationInput,
  });

  return (
    <FormProvider {...form}>
      <div className="admin-page">
        <header className="admin-page-header">
          <div className="admin-kicker">Sessions</div>
          <h2>{mode === "create" ? "Nueva sesión" : (initialSession?.title ?? "Editar sesión")}</h2>
          <p>
            Define identidad, copy y taxonomía. Si el slug cambia al guardar, el dashboard redirige
            automáticamente a la ruta final de la sesión.
          </p>
        </header>

        <McResourceEditor
          deleting={deletePending}
          dirty={formState.isDirty}
          onMcCancel={() => {
            clearErrors("root");

            if (mode === "create") {
              onCancelAction?.();
              return;
            }

            reset(toSessionFormValues(initialSession));
          }}
          onMcDelete={() => {
            setDeleteConfirmOpen(true);
          }}
          onMcSave={submitResource}
          resourceTitle={mode === "create" ? "Session draft" : (initialSession?.title ?? "Session")}
          saving={savePending}
          status={editorStatus}
        >
          <div slot="fields" className="admin-editor-layout">
            <ServerErrorMessage message={serverError} />

            <section className="admin-editor-section">
              <div className="admin-kicker">Identidad</div>
              <div className="admin-form-grid admin-form-grid--two">
                <FormTextInput<SessionFormValues>
                  label="Título"
                  name="title"
                  placeholder="Editorial al atardecer"
                  required
                />
                <FormTextInput<SessionFormValues>
                  hint="Déjalo vacío para autogenerarlo desde el título."
                  label="Slug"
                  name="slug"
                  optional
                  placeholder="editorial-atardecer"
                />
              </div>
            </section>

            <section className="admin-editor-section">
              <div className="admin-kicker">Contenido</div>
              <FormTextarea<SessionFormValues>
                label="Descripción"
                name="description"
                placeholder="<p>Describe la sesión, intención, localización o tratamiento visual.</p>"
                required
                rows={10}
              />
            </section>

            <section className="admin-editor-section">
              <div className="admin-kicker">Tags</div>
              <FormTagPicker<SessionFormValues>
                hint="Selecciona una o varias etiquetas para mantener la navegación cruzada."
                label="Tags activos"
                name="tagIds"
                options={tags.map((tag) => ({
                  id: tag.id,
                  label: tag.name,
                  description: tag.slug,
                }))}
                required
              />
            </section>
          </div>

          <div slot="aside" className="admin-aside-stack">
            <section className="admin-editor-section">
              <div className="admin-kicker">Panel lateral</div>
              <mc-status-text
                label={
                  mode === "create"
                    ? "La sesión se publicará con su slug final al primer guardado."
                    : `${initialSession?.photos?.length ?? 0} fotos relacionadas`
                }
                polite
                tone="idle"
              />
            </section>

            <section className="admin-editor-section">
              <div className="admin-kicker">Tags activos</div>
              <McTagList
                interactive={false}
                items={selectedTags.map((tag) => ({
                  id: tag.id,
                  label: tag.name,
                  selected: true,
                }))}
                selectedIds={selectedTagIds}
              />
            </section>

            <McRelationshipPanel
              emptyLabel="Esta sesión todavía no tiene fotos vinculadas."
              items={(initialSession?.photos ?? []).map((photo) => ({
                id: photo.id,
                label: photo.alt,
                count: photo.metadata.iso || undefined,
              }))}
              onMcSelect={(event) => {
                void navigate({
                  to: "/photos/$id",
                  params: { id: event.detail.selectedId },
                  search: { page: 1 },
                });
              }}
              title="Fotos relacionadas"
            />

            <ConfirmDelete
              message={
                mode === "create"
                  ? "¿Quieres descartar este borrador y volver al listado?"
                  : "¿Seguro que quieres borrar esta sesión? Esta acción es persistente."
              }
              onConfirm={onDeleteAction}
              onErrorMessage={(message) => {
                setError("root.server", {
                  type: "server",
                  message,
                });
              }}
              onOpenChange={setDeleteConfirmOpen}
              open={isDeleteConfirmOpen}
              pending={deletePending}
            />
          </div>

          <div slot="actions">
            <mc-status-text
              label={
                serverError ??
                (formState.isDirty ? "Hay cambios pendientes" : "Todo sincronizado con la sesión")
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

export function SessionEditorView({ mode }: { mode: "create" | "edit" }) {
  return mode === "create" ? <CreateSessionEditor /> : <EditSessionEditor />;
}
