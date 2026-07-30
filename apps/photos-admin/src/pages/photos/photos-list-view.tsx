import {
  McBulkActions,
  McConfirmAction,
  McResourceTable,
  McSearchField,
  McSelect,
  McStatusRegion,
} from "@murga.ing/components/react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@components/empty-state";
import { PhotoPreviewDialog } from "@components/photos/photo-preview-dialog";
import { invalidatePhotoData } from "@lib/api/invalidation";
import { photosService } from "@lib/api/photos/photos";
import { photosListQueryOptions } from "@lib/api/photos/query-options";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";

import type { ApiPhoto } from "@roncal/shared";

type PhotoQueueStatus = "awaiting_upload" | "queued" | "processing" | "succeeded" | "failed";

type PhotoWithQueueStatus = ApiPhoto & {
  queueStatus?: PhotoQueueStatus;
};

type BulkStatus = {
  label: string;
  tone: "idle" | "loading" | "success" | "error";
};

const statusPresentation: Record<
  PhotoQueueStatus,
  { label: string; tone: "default" | "accent" | "success" | "warning" | "error" }
> = {
  awaiting_upload: { label: "Pendiente", tone: "default" },
  queued: { label: "En cola", tone: "warning" },
  processing: { label: "Procesando", tone: "warning" },
  succeeded: { label: "Completada", tone: "success" },
  failed: { label: "Error", tone: "error" },
};

function getBulkResultLabel(actionLabel: string, successCount: number, failureCount: number) {
  return `${actionLabel}: ${successCount} correctas, ${failureCount} fallidas.`;
}

function PhotosTable({
  filteredPhotos,
  onEdit,
  onPreview,
  onSelectionChange,
  refetching,
  selectedIds,
  sessionTitleById,
}: {
  filteredPhotos: PhotoWithQueueStatus[];
  onEdit: (id: string) => void;
  onPreview: (photo: ApiPhoto) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  refetching: boolean;
  selectedIds: string[];
  sessionTitleById: Map<string, string>;
}) {
  return (
    <McResourceTable
      columns={[
        { id: "preview", label: "Preview", type: "media", width: "112px" },
        { id: "alt", label: "Título", type: "text" },
        { id: "session", label: "Sesión", type: "text" },
        { id: "status", label: "Estado", type: "status", width: "136px" },
      ]}
      mobileLayout="stacked"
      onMcSelectionChange={(event) => {
        onSelectionChange(event.detail.selectedIds);
      }}
      refetching={refetching}
      rows={filteredPhotos.map((photo) => {
        const status = photo.queueStatus ?? "succeeded";
        const presentation = statusPresentation[status];

        return {
          id: photo.id,
          cells: {
            preview: "",
            alt: photo.alt,
            session: sessionTitleById.get(photo.sessionId) ?? photo.sessionId,
            status: presentation.label,
          },
        };
      })}
      selectable
      selectedIds={selectedIds}
      selectAllLabel="Seleccionar todas las fotos visibles"
    >
      {filteredPhotos.flatMap((photo) => {
        const status = photo.queueStatus ?? "succeeded";
        const presentation = statusPresentation[status];
        const canPreview = status === "succeeded" && photo.url.length > 0;

        return [
          <div key={`${photo.id}:preview`} slot={`cell:${photo.id}:preview`}>
            {canPreview ? (
              <button
                aria-label={`Previsualizar ${photo.alt}`}
                className="border-mc-border-visible bg-mc-surface-raised focus-visible:outline-mc-text-display block aspect-4/3 w-20 cursor-zoom-in overflow-hidden rounded-md border p-0 focus-visible:outline-2 focus-visible:outline-offset-3 [&>img]:block [&>img]:size-full [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-200 hover:[&>img]:scale-105"
                onClick={() => {
                  onPreview(photo);
                }}
                type="button"
              >
                <img alt="" src={photo.miniature || photo.url} />
              </button>
            ) : (
              <span
                aria-label="Preview no disponible"
                className="border-mc-border-visible text-mc-text-tertiary grid aspect-4/3 w-20 place-items-center rounded-md border border-dashed"
              >
                —
              </span>
            )}
          </div>,
          <button
            className="text-mc-text-display focus-visible:outline-mc-text-display cursor-pointer border-0 bg-transparent p-0 text-left font-semibold focus-visible:outline-2 focus-visible:outline-offset-3"
            key={`${photo.id}:alt`}
            onClick={() => {
              onEdit(photo.id);
            }}
            slot={`cell:${photo.id}:alt`}
            type="button"
          >
            {photo.alt}
          </button>,
          <div key={`${photo.id}:status`} slot={`cell:${photo.id}:status`}>
            <mc-badge tone={presentation.tone}>{presentation.label}</mc-badge>
          </div>,
        ];
      })}
    </McResourceTable>
  );
}

export function PhotosListView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: photos, isFetching } = useSuspenseQuery(photosListQueryOptions());
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const [searchValue, setSearchValue] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<ApiPhoto | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sessionSelectOpen, setSessionSelectOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<BulkStatus | null>(null);
  const [statusRegionOpen, setStatusRegionOpen] = useState(false);
  const deferredSearch = useDeferredValue(searchValue);
  const sessionTitleById = new Map(sessions.map((session) => [session.id, session.title]));
  const photosWithStatus: PhotoWithQueueStatus[] = photos;
  const filteredPhotos = photosWithStatus.filter((photo) => {
    const haystack = [
      photo.alt,
      photo.about,
      photo.url,
      sessionTitleById.get(photo.sessionId) ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(deferredSearch.toLowerCase());
  });

  async function runBulkOperation({
    actionLabel,
    operation,
  }: {
    actionLabel: string;
    operation: (id: string) => Promise<unknown>;
  }) {
    const operationIds = [...selectedIds];
    let completedCount = 0;
    setBulkPending(true);
    setBulkStatus({
      label: `${actionLabel}: 0 de ${operationIds.length} completadas.`,
      tone: "loading",
    });

    const results = await Promise.allSettled(
      operationIds.map(async (id) => {
        try {
          return await operation(id);
        } finally {
          completedCount += 1;
          setBulkStatus({
            label: `${actionLabel}: ${completedCount} de ${operationIds.length} completadas.`,
            tone: "loading",
          });
        }
      }),
    );
    const failedIds = operationIds.filter((_, index) => results[index]?.status === "rejected");
    const successCount = results.length - failedIds.length;
    let resultStatus: BulkStatus = {
      label: getBulkResultLabel(actionLabel, successCount, failedIds.length),
      tone: failedIds.length > 0 ? "error" : "success",
    };

    try {
      await invalidatePhotoData(queryClient);
    } catch {
      resultStatus = {
        label: `${resultStatus.label} No se pudieron actualizar los datos visibles.`,
        tone: "error",
      };
    }
    setSelectedIds(failedIds);
    setBulkStatus(resultStatus);
    setStatusRegionOpen(true);
    setBulkPending(false);
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div className="admin-kicker">Photos</div>
        <p>
          Revisa previews, estado de procesamiento y sesión. Abre cada título para completar su
          edición.
        </p>
      </header>

      <section className="admin-table-shell">
        {selectedIds.length > 0 ? (
          <McBulkActions
            cancelLabel="Cancelar selección"
            count={selectedIds.length}
            disabled={bulkPending}
            label={`${selectedIds.length} seleccionadas`}
            onMcClearSelection={() => {
              setSelectedIds([]);
              setBulkStatus(null);
            }}
          >
            <McSelect
              ariaLabel="Sesión para las fotos seleccionadas"
              disabled={bulkPending}
              onMcChange={(event) => {
                setSelectedSessionId(event.detail.selectedId ?? "");
                setSessionSelectOpen(false);
              }}
              onMcOpenChange={(event) => {
                setSessionSelectOpen(event.detail.open);
              }}
              open={sessionSelectOpen}
              options={sessions.map((session) => ({
                id: session.id,
                label: session.title,
                description: session.slug,
              }))}
              placeholder="Asignar a sesión"
              selectedId={selectedSessionId || null}
              slot="actions"
            />
            <mc-button
              disabled={bulkPending || selectedSessionId.length === 0}
              onClick={() => {
                void runBulkOperation({
                  actionLabel: "Asignación",
                  operation: (id) =>
                    photosService.updatePhoto(id, { sessionId: selectedSessionId }),
                });
              }}
              size="sm"
              slot="actions"
              variant="secondary"
            >
              Asignar a sesión
            </mc-button>
            <mc-button
              disabled={bulkPending}
              onClick={() => {
                setConfirmDeleteOpen(true);
              }}
              size="sm"
              slot="actions"
              variant="destructive"
            >
              Eliminar
            </mc-button>
            {bulkStatus ? (
              <mc-status-text
                label={bulkStatus.label}
                polite
                slot="status"
                tone={bulkStatus.tone}
              />
            ) : null}
          </McBulkActions>
        ) : (
          <div className="admin-toolbar">
            <div className="admin-toolbar-controls">
              <McSearchField
                onMcChange={(event) => {
                  setSearchValue(event.detail.value);
                }}
                onMcClear={() => {
                  setSearchValue("");
                }}
                placeholder="Buscar por alt, sesión o URL"
                value={searchValue}
              />
              <mc-status-text
                label={`${filteredPhotos.length} resultados visibles / ${photos.length} totales`}
                polite
                tone="idle"
              />
            </div>
            <mc-button
              className="admin-inline-button"
              onClick={() => {
                void navigate({ to: "/photos/new" });
              }}
              variant="primary"
            >
              Subir fotos
            </mc-button>
          </div>
        )}

        {filteredPhotos.length > 0 ? (
          <PhotosTable
            filteredPhotos={filteredPhotos}
            onEdit={(id) => {
              void navigate({
                to: "/photos/$id",
                params: { id },
              });
            }}
            onPreview={setPreviewPhoto}
            onSelectionChange={(nextSelectedIds) => {
              setSelectedIds(nextSelectedIds);
              setBulkStatus(null);
            }}
            refetching={isFetching}
            selectedIds={selectedIds}
            sessionTitleById={sessionTitleById}
          />
        ) : (
          <EmptyState
            action={
              <mc-button
                className="admin-inline-button"
                onClick={() => {
                  void navigate({ to: "/photos/new" });
                }}
                variant="primary"
              >
                Subir fotos
              </mc-button>
            }
            description="Prueba con otra búsqueda o prepara un nuevo lote de imágenes."
            title="No hay fotos visibles"
          />
        )}
      </section>

      <PhotoPreviewDialog
        onClose={() => {
          setPreviewPhoto(null);
        }}
        photo={previewPhoto}
      />
      <McConfirmAction
        cancelLabel="Cancelar"
        confirmLabel="Eliminar fotos"
        dialogLabel="Confirmar eliminación de fotos"
        message={`Se eliminarán ${selectedIds.length} fotos. Esta acción no se puede deshacer.`}
        onMcCancel={() => {
          setConfirmDeleteOpen(false);
        }}
        onMcConfirm={() => {
          setConfirmDeleteOpen(false);
          void runBulkOperation({
            actionLabel: "Eliminación",
            operation: (id) => photosService.deletePhoto(id),
          });
        }}
        onMcOpenChange={(event) => {
          setConfirmDeleteOpen(event.detail.open);
        }}
        open={confirmDeleteOpen}
        pending={bulkPending}
      />
      <McStatusRegion
        autoDismiss={8000}
        dismissLabel="Cerrar resultado de la operación"
        label={bulkStatus?.label ?? ""}
        onMcDismiss={() => {
          setStatusRegionOpen(false);
        }}
        open={statusRegionOpen}
        tone={bulkStatus?.tone ?? "idle"}
      />
    </div>
  );
}
