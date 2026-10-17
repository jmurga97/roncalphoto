import { Button } from "@jmurga97/components";
import { Link } from "@tanstack/react-router";

import { PageHeader } from "@components/page-header";

export function NotFoundState() {
  return (
    <div className="ming-page">
      <PageHeader title="Página no encontrada" description="Vuelve al resumen para continuar con tu portfolio." />
      <Button className="admin-inline-button" variant="secondary" nativeButton={false} render={<Link to="/" />}>
        Volver al resumen
      </Button>
    </div>
  );
}
