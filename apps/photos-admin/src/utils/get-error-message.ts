export function getErrorMessage(error: unknown, fallback = "Ha ocurrido un error inesperado.") {
  return error instanceof Error && error.message ? error.message : fallback;
}
