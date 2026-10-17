import { StatusText } from "@jmurga97/components";

export function LoadingState({ label = "Cargando panel…" }: { label?: string }) {
  return (
    <div className="ming-page">
      <StatusText label={label} tone="info" />
    </div>
  );
}
