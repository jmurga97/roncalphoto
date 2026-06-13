import type { ApiPhoto } from "@roncal/shared";

export type PhotoQueueStatus = "awaiting_upload" | "queued" | "processing" | "succeeded" | "failed";

export type PhotoWithQueueStatus = ApiPhoto & {
  queueStatus?: PhotoQueueStatus;
};

const statusPresentation: Record<
  PhotoQueueStatus,
  { label: string; tone: "default" | "accent" | "success" | "warning" | "error" }
> = {
  awaiting_upload: { label: "Pendiente", tone: "default" },
  queued: { label: "En cola", tone: "warning" },
  processing: { label: "Procesando", tone: "accent" },
  succeeded: { label: "Completada", tone: "success" },
  failed: { label: "Error", tone: "error" },
};

export function PhotosResourceList({
  onEdit,
  onPreview,
  photos,
  sessionTitleById,
}: {
  onEdit: (id: string) => void;
  onPreview: (photo: ApiPhoto) => void;
  photos: PhotoWithQueueStatus[];
  sessionTitleById: Map<string, string>;
}) {
  const mobileCellLabelClass =
    "max-sm:before:text-mc-text-secondary max-sm:before:mb-0.5 max-sm:before:block max-sm:before:font-mono max-sm:before:text-[0.625rem] max-sm:before:tracking-[0.08em] max-sm:before:uppercase max-sm:before:content-[attr(data-label)]";

  return (
    <div className="border-mc-border bg-mc-surface overflow-x-auto rounded-[0.875rem] border max-sm:overflow-visible max-sm:border-0 max-sm:bg-transparent">
      <table className="w-full border-collapse max-sm:block">
        <thead className="max-sm:absolute max-sm:size-px max-sm:overflow-hidden max-sm:whitespace-nowrap max-sm:[clip:rect(0_0_0_0)]">
          <tr>
            {["Preview", "Título", "Sesión", "Estado"].map((label) => (
              <th
                key={label}
                className="border-mc-border text-mc-text-secondary border-b px-4 py-3.5 text-left align-middle font-mono text-[0.6875rem] font-normal tracking-[0.08em] uppercase"
                scope="col"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-sm:grid max-sm:w-full max-sm:gap-4">
          {photos.map((photo) => {
            const status = photo.queueStatus ?? "succeeded";
            const presentation = statusPresentation[status];
            const canPreview = status === "succeeded" && photo.url.length > 0;

            return (
              <tr
                key={photo.id}
                className="last:[&>td]:border-b-0 max-sm:border-mc-border max-sm:bg-mc-surface max-sm:grid max-sm:w-full max-sm:grid-cols-[5rem_minmax(0,1fr)] max-sm:gap-x-4 max-sm:gap-y-3 max-sm:rounded-[0.875rem] max-sm:border max-sm:p-4"
              >
                <td
                  className="border-mc-border border-b px-4 py-3.5 align-middle max-sm:row-span-3 max-sm:block max-sm:w-full max-sm:border-0 max-sm:p-0"
                  data-label="Preview"
                >
                  {canPreview ? (
                    <button
                      aria-label={`Previsualizar ${photo.alt}`}
                      className="border-mc-border-visible bg-mc-surface-raised focus-visible:outline-mc-accent block aspect-4/3 w-20 cursor-zoom-in overflow-hidden rounded-md border p-0 focus-visible:outline-2 focus-visible:outline-offset-3 [&>img]:block [&>img]:size-full [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-200 hover:[&>img]:scale-105"
                      onClick={() => {
                        onPreview(photo);
                      }}
                      type="button"
                    >
                      <img alt="" src={photo.miniature || photo.url} />
                    </button>
                  ) : (
                    <span
                      className="border-mc-border-visible text-mc-text-disabled grid aspect-4/3 w-20 place-items-center rounded-md border border-dashed"
                      aria-label="Preview no disponible"
                    >
                      —
                    </span>
                  )}
                </td>
                <td
                  className={`border-mc-border border-b px-4 py-3.5 align-middle max-sm:block max-sm:w-full max-sm:border-0 max-sm:p-0 ${mobileCellLabelClass}`}
                  data-label="Título"
                >
                  <button
                    className="text-mc-text-display hover:text-mc-accent focus-visible:outline-mc-accent cursor-pointer border-0 bg-transparent p-0 text-left font-semibold focus-visible:outline-2 focus-visible:outline-offset-3"
                    onClick={() => {
                      onEdit(photo.id);
                    }}
                    type="button"
                  >
                    {photo.alt}
                  </button>
                </td>
                <td
                  className={`border-mc-border border-b px-4 py-3.5 align-middle max-sm:block max-sm:w-full max-sm:border-0 max-sm:p-0 ${mobileCellLabelClass}`}
                  data-label="Sesión"
                >
                  {sessionTitleById.get(photo.sessionId) ?? photo.sessionId}
                </td>
                <td
                  className={`border-mc-border border-b px-4 py-3.5 align-middle max-sm:block max-sm:w-full max-sm:border-0 max-sm:p-0 ${mobileCellLabelClass}`}
                  data-label="Estado"
                >
                  <mc-badge tone={presentation.tone}>{presentation.label}</mc-badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
