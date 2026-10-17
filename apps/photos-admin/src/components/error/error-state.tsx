import { Button, InlineMessage } from "@jmurga97/components";
import { useRouter } from "@tanstack/react-router";

import { PageHeader } from "@components/page-header";

export function RouteErrorState({ reset }: { error: Error; reset?: () => void }) {
  const router = useRouter();
  return (
    <div className="ming-page">
      <PageHeader title="No se pudo cargar esta vista" />
      <div className="ming-stack">
        <InlineMessage
          title="Datos no disponibles"
          message="Comprueba tu conexión y vuelve a intentarlo."
          tone="error"
        />
        <Button
          className="admin-inline-button"
          variant="secondary"
          onClick={() => {
            void router.invalidate().then(() => reset?.());
          }}
        >
          Reintentar
        </Button>
      </div>
    </div>
  );
}
