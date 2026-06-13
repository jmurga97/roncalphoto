export interface BatchPhotoPreview {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
}

function formatFileSize(sizeBytes: number) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 1,
    style: "unit",
    unit: "megabyte",
    unitDisplay: "short",
  }).format(sizeBytes / (1024 * 1024));
}

export function BatchPhotoPreviewGrid({
  items,
  onRemove,
}: {
  items: BatchPhotoPreview[];
  onRemove: (id: string) => void;
}) {
  return (
    <ul
      className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),1fr))] gap-4 p-0"
      aria-label="Imágenes seleccionadas"
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="border-mc-border bg-mc-surface min-w-0 overflow-hidden rounded-[0.875rem] border"
        >
          <div className="bg-mc-surface-raised aspect-4/3 overflow-hidden">
            <img className="block size-full object-cover" alt="" src={item.previewUrl} />
          </div>
          <div className="grid gap-4 p-4">
            <div className="min-w-0">
              <h3 className="text-mc-text-display m-0 truncate text-base">{item.title}</h3>
              <p
                className="text-mc-text-secondary m-0 truncate text-[0.8125rem]"
                title={item.file.name}
              >
                {item.file.name}
              </p>
            </div>
            <div className="text-mc-text-secondary flex items-center justify-between gap-3 text-[0.8125rem]">
              <span>{formatFileSize(item.file.size)}</span>
              <mc-button
                aria-label={`Quitar ${item.file.name}`}
                onClick={() => {
                  onRemove(item.id);
                }}
                size="sm"
                variant="ghost"
              >
                Quitar
              </mc-button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
