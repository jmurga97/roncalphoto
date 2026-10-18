import {
  BulkActions,
  Button,
  ConfirmAction,
  DropdownMenu,
  ResourceTable,
  SearchField,
  Select,
  StatusText,
} from "@jmurga97/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@components/page-header";
import { PhotoPreviewDialog } from "@components/photos/photo-preview-dialog";
import { RowControls } from "@components/row-controls";
import { invalidatePortfolio, trpc, trpcClient } from "@lib/api/client";

import type { Photo } from "@roncal/api/router";

type BulkStatus = {
  label: string;
  tone: "neutral" | "info" | "success" | "error";
};

const PAGE_SIZE = 50;

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
  filteredPhotos: Photo[];
  onEdit: (id: string) => void;
  onPreview: (photo: Photo) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  refetching: boolean;
  selectedIds: string[];
  sessionTitleById: Map<string, string>;
}) {
  return (
    <ResourceTable
      ariaLabel="Fotos"
      actionsLabel="Acciones"
      columns={[
        {
          id: "alt",
          header: "Título",
          render: (photo) => <span className="[overflow-wrap:anywhere]">{photo.alt}</span>,
        },
        {
          id: "preview",
          header: "Vista previa",
          width: "112px",
          render: (photo) =>
            photo.url ? (
              <RowControls>
                <Button
                  variant="ghost"
                  aria-label={`Previsualizar ${photo.alt}`}
                  className="admin-photo-preview-button bg-[var(--color-surface-2)]"
                  onClick={() => {
                    onPreview(photo);
                  }}
                  type="button"
                >
                  <img
                    alt=""
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                    src={photo.miniature || photo.url}
                  />
                </Button>
              </RowControls>
            ) : (
              <span aria-label="Vista previa no disponible" className="admin-photo-preview-empty">
                —
              </span>
            ),
        },
        {
          id: "session",
          header: "Sesión",
          render: (photo) => (
            <span className="[overflow-wrap:anywhere]">{sessionTitleById.get(photo.sessionId) ?? photo.sessionId}</span>
          ),
        },
      ]}
      onRowActivate={(photo) => onEdit(photo.id)}
      renderRowActions={(photo) => (
        <RowControls>
          <DropdownMenu
            ariaLabel={`Acciones para ${photo.alt}`}
            align="end"
            trigger="⋯"
            items={[
              { id: "edit", label: "Editar foto", onSelect: () => onEdit(photo.id) },
              {
                id: "preview",
                label: "Ver foto",
                disabled: !photo.url,
                onSelect: () => onPreview(photo),
              },
            ]}
          />
        </RowControls>
      )}
      emptyState="No hay fotos que coincidan. Prueba con otra búsqueda o sube imágenes."
      refetchingLabel="Actualizando fotos…"
      getRowId={(photo) => photo.id}
      onSelectionChange={(ids) => {
        onSelectionChange(ids.map(String));
      }}
      refetching={refetching}
      responsive="stacked"
      rows={filteredPhotos}
      selectedIds={selectedIds}
      selectionLabels={{
        page: "Seleccionar todas las fotos visibles",
        row: (photo) => `Seleccionar ${photo.alt}`,
      }}
    />
  );
}

export function PhotosListView() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const { data: photos, isFetching } = useSuspenseQuery(
    trpc.photos.list.queryOptions({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, search: deferredSearch }),
  );
  const { data: sessions } = useSuspenseQuery(trpc.sessions.list.queryOptions());
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sessionSelectOpen, setSessionSelectOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<BulkStatus | null>(null);
  const sessionTitleById = new Map(sessions.map((session) => [session.id, session.title]));
  const pageCount = Math.max(1, Math.ceil(photos.total / PAGE_SIZE));

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
      tone: "info",
    });

    const results = await Promise.allSettled(
      operationIds.map(async (id) => {
        try {
          return await operation(id);
        } finally {
          completedCount += 1;
          setBulkStatus({
            label: `${actionLabel}: ${completedCount} de ${operationIds.length} completadas.`,
            tone: "info",
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
      await invalidatePortfolio();
    } catch {
      resultStatus = {
        label: `${resultStatus.label} No se pudieron actualizar los datos visibles.`,
        tone: "error",
      };
    }
    setPage(0);
    setSelectedIds(failedIds);
    setBulkStatus(null);
    if (resultStatus.tone === "error") toast.error(resultStatus.label);
    else toast.success(resultStatus.label);
    setBulkPending(false);
  }

  return (
    <div className="ming-page">
      <PageHeader
        title="Fotos"
        description="Revisa las imágenes, su estado y la sesión a la que pertenecen."
        actions={
          <Button
            onClick={() => {
              void navigate({ to: "/photos/new" });
            }}
          >
            Subir fotos
          </Button>
        }
      />

      <section className="admin-table-shell">
        {selectedIds.length > 0 ? (
          <BulkActions
            className="admin-bulk-actions"
            clearLabel="Cancelar selección"
            count={selectedIds.length}
            disabled={bulkPending}
            label={`${selectedIds.length} ${selectedIds.length === 1 ? "seleccionada" : "seleccionadas"}`}
            onClearSelection={() => {
              setSelectedIds([]);
              setBulkStatus(null);
            }}
            actions={
              <div className="ming-cluster admin-bulk-controls">
                <Select
                  ariaLabel="Sesión para las fotos seleccionadas"
                  disabled={bulkPending}
                  onValueChange={(value) => {
                    setSelectedSessionId(value ?? "");
                    setSessionSelectOpen(false);
                  }}
                  onOpenChange={setSessionSelectOpen}
                  open={sessionSelectOpen}
                  options={sessions.map((session) => ({
                    id: session.id,
                    label: session.title,
                    description: session.slug,
                  }))}
                  placeholder="Asignar a sesión"
                  value={selectedSessionId || null}
                />
                <Button
                  disabled={bulkPending || selectedSessionId.length === 0}
                  onClick={() => {
                    void runBulkOperation({
                      actionLabel: "Asignación",
                      operation: (id) =>
                        trpcClient.photos.update.mutate({
                          id,
                          data: { sessionId: selectedSessionId },
                        }),
                    });
                  }}
                  size="sm"
                  variant="secondary"
                >
                  Asignar a sesión
                </Button>
                <Button
                  disabled={bulkPending}
                  onClick={() => {
                    setConfirmDeleteOpen(true);
                  }}
                  size="sm"
                  variant="destructive"
                >
                  Eliminar
                </Button>
              </div>
            }
            status={
              bulkStatus && bulkPending ? <StatusText label={bulkStatus.label} polite tone={bulkStatus.tone} /> : null
            }
          />
        ) : (
          <div className="ming-toolbar">
            <div className="admin-toolbar-controls">
              <SearchField
                className="admin-search"
                clearLabel="Borrar búsqueda"
                aria-label="Buscar fotos"
                onValueChange={(value) => {
                  setSearchValue(value);
                  setPage(0);
                }}
                onClear={() => {
                  setSearchValue("");
                  setPage(0);
                }}
                placeholder="Buscar por título o sesión"
                value={searchValue}
              />
              <StatusText
                label={`${photos.items.length} ${photos.items.length === 1 ? "resultado visible" : "resultados visibles"} / ${photos.total} ${photos.total === 1 ? "total" : "totales"}`}
                polite
                tone="neutral"
              />
            </div>
          </div>
        )}

        <PhotosTable
          filteredPhotos={photos.items}
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
        <div className="ming-cluster ming-cluster--between mt-3">
          <span className="ming-data">
            Página {page + 1} de {pageCount}
          </span>
          <div className="ming-cluster">
            <Button disabled={page === 0} onClick={() => setPage(page - 1)} size="sm" variant="secondary">
              Anterior
            </Button>
            <Button disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)} size="sm" variant="secondary">
              Siguiente
            </Button>
          </div>
        </div>
      </section>

      <PhotoPreviewDialog
        onClose={() => {
          setPreviewPhoto(null);
        }}
        photo={previewPhoto}
      />
      <ConfirmAction
        cancelLabel="Cancelar"
        confirmLabel="Eliminar fotos"
        title={`¿Eliminar ${selectedIds.length} ${selectedIds.length === 1 ? "foto" : "fotos"}?`}
        message={`Se eliminarán ${selectedIds.length} ${selectedIds.length === 1 ? "foto" : "fotos"}. Esta acción no se puede deshacer.`}
        onCancel={() => {
          setConfirmDeleteOpen(false);
        }}
        onConfirm={() => {
          void runBulkOperation({
            actionLabel: "Eliminación",
            operation: (id) => trpcClient.photos.delete.mutate({ id }),
          }).then(() => setConfirmDeleteOpen(false));
        }}
        onOpenChange={setConfirmDeleteOpen}
        open={confirmDeleteOpen}
        pending={bulkPending}
      />
    </div>
  );
}
