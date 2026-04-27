import { useParams, useSearch } from "@tanstack/react-router";

export function useSidebarData() {
  const search = useSearch({
    from: "/_app/session/$slug",
    shouldThrow: false,
  });
  const params = useParams({
    from: "/_app/session/$slug",
    shouldThrow: false,
  });

  return {
    photo: search?.photo,
    slug: params?.slug,
  };
}
