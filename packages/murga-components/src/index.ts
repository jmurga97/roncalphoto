import { McPlaceholder, defineMcPlaceholder } from "./components/mc-placeholder";

defineMcPlaceholder();

export { McPlaceholder, defineMcPlaceholder };
export type {
  MurgaApiConfig,
  MurgaApiError,
  MurgaApiPaginated,
  MurgaApiSuccess,
  MurgaCrudEventDetail,
  MurgaFieldChangeDetail,
  MurgaHttpMethod,
  MurgaPagination,
} from "./types";

export const murgaComponentRegistry = ["mc-placeholder"] as const;

export function registerMurgaComponents() {
  defineMcPlaceholder();
}
