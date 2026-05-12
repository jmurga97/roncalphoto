# @roncal/photos-app

Public portfolio frontend for RoncalPhoto. Built with Vite, React 19, TanStack Router and Tailwind CSS 4.

## Package purpose

This is the customer-facing photo gallery. It displays photography sessions in a scrollable, keyboard-navigable layout and provides an editorial sidebar with session metadata, tags and related sessions.

## Internal dependencies

| Package          | Usage                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `@roncal/shared` | Domain types (`Session`, `Photo`, etc.), API mappers (`apiSessionToSession`) and runtime helpers (`resolveApiBaseUrl`). |
| `@roncal/ui`     | `SuspenseWrapper` component used inside the sidebar to isolate data-fetching errors with error boundaries.              |

## Folder structure

```text
src/
├── app/
│   ├── main.tsx              # React root + router bootstrap
│   ├── providers.tsx         # QueryClientProvider + theme effect
│   ├── layouts/
│   │   └── main-layout.tsx   # Sidebar + main content area
│   ├── routes/               # TanStack file-based routes
│   ├── store/                # Zustand store (sidebar + theme slices)
│   └── styles/               # Global CSS, tokens, sidebar & gallery styles
├── components/
│   ├── sidebar/              # Editorial sidebar with sub-components
│   ├── brand/                # RoncalPhoto logo link
│   ├── error/                # Route error fallback
│   ├── loading/              # Route pending fallback
│   └── not-found-state.tsx   # 404 view
├── lib/
│   ├── http-client.ts        # fetch wrapper + API response reader
│   ├── query-client.ts       # TanStack Query client config
│   └── api/sessions/         # Session service + query options
├── pages/
│   ├── home/                 # Masonry session grid
│   ├── gallery/              # Scrollable photo gallery
│   └── about/                # "About us" slide-up panel
└── utils/                    # Small helpers (media queries, keyboard nav, etc.)
```

## Architecture

- **File-based routing** (`src/app/routes/`) with TanStack Router.
- **Server state** managed by TanStack Query; queries are pre-fetched in route loaders.
- **Client state** managed by Zustand with `persist` middleware (sidebar open state and theme are stored in `localStorage`).
- **Data layer** (`src/lib/api/`) separates HTTP transport (`http-client.ts`) from domain services (`sessions.ts`).
- **View models** (`useGalleryViewModel`) transform API data into UI-specific shapes before passing them to components.

## Request lifecycle

1. **Router loader** (`_app.tsx`, `_app.session.$slug.tsx`) calls `queryClient.ensureQueryData(...)`.
2. **Query options** (`src/lib/api/sessions/query-options.ts`) define the query key and stale time.
3. **Service** (`sessions.ts`) calls `httpClient` and normalises the response with `readApiResponse`.
4. **`httpClient`** prepends the API base URL and sets JSON content-type when needed.
5. **Component** uses `useSuspenseQuery` (or `useQuery`) to read the cached data.
6. **View model** maps the raw `Session` into component-friendly types (`GalleryPhotoViewModel`).

## Configuration

| Variable       | Purpose                                               |
| -------------- | ----------------------------------------------------- |
| `VITE_API_URL` | Base URL for API requests (used in `http-client.ts`). |

The Vite dev server proxies `/api` and `/health` to this URL automatically.

### Cloudflare Workers deploy credentials

`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` must be configured as
Cloudflare build/deploy environment variables only when deploying this app from
an external CI environment. For Cloudflare Workers Builds, use the project's
configured Build API token instead of adding these values to the repo,
`wrangler.toml`, `.env.example`, or runtime variables.

## Available scripts

```bash
bun run dev      # Start Vite dev server
bun run build    # Production build
bun run preview  # Preview built app with Wrangler Workers
bun run check    # TypeScript type check
```

## Relevant technical decisions

- **Snap scrolling gallery** — The gallery uses CSS `snap-y snap-mandatory` combined with an `IntersectionObserver` so that scrolling and keyboard navigation stay in sync with the URL (`?photo=<id>`).
- **Desktop vs mobile sidebar** — The sidebar maintains two independent open flags (`isSidebarOpenDesktop` / `isSidebarOpenMobile`). On mobile the sidebar acts as an overlay with its own focus-trap and Escape-to-close behaviour.
- **Theme hydration** — The HTML document runs an inline script in `index.html` that reads the persisted theme from `localStorage` before React hydrates, preventing a flash of the wrong theme.
- **View transitions** — Session navigation uses the View Transitions API when supported and when the user does not prefer reduced motion.
