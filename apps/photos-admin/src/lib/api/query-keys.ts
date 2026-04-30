export const adminQueryKeys = {
  sessions: {
    all: ["admin", "sessions"] as const,
    list: () => [...adminQueryKeys.sessions.all, "list"] as const,
    detail: (slug: string) => [...adminQueryKeys.sessions.all, "detail", slug] as const,
  },
  photos: {
    all: ["admin", "photos"] as const,
    list: (page: number, pageSize: number) =>
      [...adminQueryKeys.photos.all, "list", page, pageSize] as const,
    detail: (id: string) => [...adminQueryKeys.photos.all, "detail", id] as const,
  },
  tags: {
    all: ["admin", "tags"] as const,
    list: () => [...adminQueryKeys.tags.all, "list"] as const,
    detail: (slug: string) => [...adminQueryKeys.tags.all, "detail", slug] as const,
  },
};
