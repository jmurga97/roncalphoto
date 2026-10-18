import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ConfirmAction, RelationshipPanel, ResourceEditor, StatusText, TagList } from "@jmurga97/components";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormTagPicker } from "@components/forms/adapters/form-tag-picker";
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

import type { RouterInputs, Session, Tag } from "@roncal/api/router";

const sessionSchema = z.object({
  title: z.string().trim().min(1, { error: "El título es obligatorio." }).max(120, { error: "Máximo 120 caracteres." }),
  slug: z.string().trim(),
  description: z
    .string()
    .trim()
    .min(1, { error: "La descripción es obligatoria." })
    .max(5000, { error: "Máximo 5.000 caracteres." }),
  tagIds: z.array(z.string()).min(1, { error: "Selecciona al menos un tag." }),
});

type SessionFormValues = z.infer<typeof sessionSchema>;
type SessionRecord = Session;
type SessionMutationInput = RouterInputs["sessions"]["create"];

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
  const { data: tags } = useSuspenseQuery(trpc.tags.list.queryOptions());
  const saveMutation = useMutation(trpc.sessions.create.mutationOptions());

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
        await invalidatePortfolio();
        queryClient.setQueryData(trpc.sessions.get.queryKey({ slug: session.slug }), session);
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
  const { data: session } = useSuspenseQuery(trpc.sessions.get.queryOptions({ slug: params.slug }));
  const { data: tags } = useSuspenseQuery(trpc.tags.list.queryOptions());
  const saveMutation = useMutation(trpc.sessions.update.mutationOptions());
  const deleteMutation = useMutation(trpc.sessions.delete.mutationOptions());

  return (
    <SessionEditorForm
      initialSession={session}
      mode="edit"
      onDeleteAction={async () => {
        await deleteMutation.mutateAsync({ slug: session.slug });
        await invalidatePortfolio();
        await navigate({ to: "/sessions" });
        document.querySelector("h1")?.focus();
      }}
      onSaveAction={async (input) => {
        const nextSession = await saveMutation.mutateAsync({ slug: session.slug, data: input });
        await invalidatePortfolio();
        queryClient.setQueryData(trpc.sessions.get.queryKey({ slug: nextSession.slug }), nextSession);

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
  const [isBackConfirmOpen, setBackConfirmOpen] = useState(false);
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: toSessionFormValues(initialSession),
  });
  const { clearErrors, formState, reset } = form;
  const selectedTagIds = useWatch({ control: form.control, name: "tagIds" });
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const relatedPhotoCount = initialSession?.photos.length ?? 0;
  const relatedPhotoLabel = relatedPhotoCount === 1 ? "foto relacionada" : "fotos relacionadas";
  const sessionStatus =
    mode === "create"
      ? "La sesión se publicará con su slug final al primer guardado."
      : `${relatedPhotoCount} ${relatedPhotoLabel}`;
  const serverError = getServerError(form);
  const editorStatus = getEditorStatus({
    deletePending,
    isDirty: formState.isDirty,
    isSubmitSuccessful: formState.isSubmitSuccessful,
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
      <div className="ming-page">
        <PageHeader hidden title={mode === "create" ? "Nueva sesión" : (initialSession?.title ?? "Sesión")} />

        <ResourceEditor
          className="admin-resource-editor"
          deleting={deletePending}
          dirty={formState.isDirty}
          resourceTitle={
            <span className="grid justify-items-start gap-2">
              <Button
                nativeButton={false}
                render={
                  <Link
                    to="/sessions"
                    onClick={(event) => {
                      if (!formState.isDirty) return;
                      event.preventDefault();
                      setBackConfirmOpen(true);
                    }}
                  />
                }
                size="sm"
                variant="ghost"
              >
                ← Sesiones
              </Button>
              <span>{mode === "create" ? "Nueva sesión" : (initialSession?.title ?? "Sesión")}</span>
            </span>
          }
          onCancel={() => {
            clearErrors("root");

            if (mode === "create") {
              onCancelAction?.();
              return;
            }

            reset(toSessionFormValues(initialSession));
          }}
          onDelete={mode === "edit" ? () => setDeleteConfirmOpen(true) : undefined}
          onSave={submitResource}
          saveLabel="Guardar cambios"
          cancelLabel="Descartar cambios"
          deleteLabel="Eliminar"
          saving={savePending}
          status={
            <StatusText
              label={editorStatus?.label ?? (mode === "create" ? "Borrador" : "Sin cambios")}
              tone={editorStatus?.tone ?? "neutral"}
              aria-live="off"
            />
          }
          aside={
            <div className="admin-aside-stack">
              <section className="admin-editor-section">
                <div className="admin-kicker">Sesión</div>
                <StatusText label={sessionStatus} polite tone="neutral" />
              </section>
              <section className="admin-editor-section">
                <div className="admin-kicker">Etiquetas</div>
                <TagList
                  interactive={false}
                  items={selectedTags.map((tag) => ({ id: tag.id, label: tag.name }))}
                  value={selectedTagIds}
                />
              </section>
              <RelationshipPanel
                emptyLabel="Esta sesión todavía no tiene fotos vinculadas."
                items={(initialSession?.photos ?? []).map((photo) => ({
                  id: photo.id,
                  label: photo.alt,
                  description: photo.metadata.iso ? `ISO ${photo.metadata.iso}` : undefined,
                }))}
                onValueChange={(selectedId) => {
                  void navigate({ to: "/photos/$id", params: { id: selectedId } });
                }}
                title="Fotos relacionadas"
              />
              <ConfirmDelete
                title="¿Eliminar sesión?"
                confirmLabel="Eliminar sesión"
                message={
                  mode === "create"
                    ? "¿Quieres descartar este borrador y volver al listado?"
                    : "¿Seguro que quieres borrar esta sesión? Esta acción no se puede deshacer."
                }
                onConfirm={onDeleteAction}
                onOpenChange={setDeleteConfirmOpen}
                open={isDeleteConfirmOpen}
                pending={deletePending}
              />
              <ConfirmAction
                cancelLabel="Seguir editando"
                confirmLabel="Descartar cambios"
                message="Los cambios sin guardar se perderán al volver a sesiones."
                onCancel={() => setBackConfirmOpen(false)}
                onConfirm={() => {
                  setBackConfirmOpen(false);
                  void navigate({ to: "/sessions" });
                }}
                onOpenChange={setBackConfirmOpen}
                open={isBackConfirmOpen}
                title="¿Descartar cambios?"
              />
            </div>
          }
        >
          <div className="admin-editor-layout">
            <section className="admin-editor-section">
              <div className="admin-kicker">Identidad</div>
              <div className="admin-form-grid admin-form-grid--two">
                <FormTextInput<SessionFormValues>
                  label="Título"
                  maxLength={120}
                  name="title"
                  placeholder="Editorial al atardecer"
                  required
                />
                <FormTextInput<SessionFormValues>
                  hint="Déjalo vacío para generarlo a partir del título"
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
                maxLength={5000}
                name="description"
                placeholder="<p>Describe la sesión, intención, localización o tratamiento visual.</p>"
                required
                rows={10}
              />
            </section>

            <section className="admin-editor-section">
              <div className="admin-kicker">Etiquetas</div>
              <FormTagPicker<SessionFormValues>
                hint="Selecciona las etiquetas que describen esta sesión"
                label="Etiquetas"
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
        </ResourceEditor>
      </div>
    </FormProvider>
  );
}

export function SessionEditorView({ mode }: { mode: "create" | "edit" }) {
  return mode === "create" ? <CreateSessionEditor /> : <EditSessionEditor />;
}
