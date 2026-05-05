# @roncal/photos-admin

Protected admin dashboard for RoncalPhoto. Built with Vite, React 19, TanStack
Router, Tailwind CSS 4 and `@murga/components`.

## Package purpose

This app is the editorial dashboard used to manage sessions, photos and upload
flows. It authenticates through the API's Better Auth OTP endpoints and consumes
the same public/domain API contracts as the public photos app.

## Configuration

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL for API requests. Optional in production unless a non-default API origin is required. |

### Cloudflare Workers deploy credentials

`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` must be configured as
Cloudflare build/deploy environment variables only when deploying this app from
an external CI environment. For Cloudflare Workers Builds, use the project's
configured Build API token instead of adding these values to the repo,
`wrangler.toml`, `.env.example`, or runtime variables.

Recommended Cloudflare Workers Builds configuration:

```bash
# Build command
cd ../../ && bun install && bunx turbo run build --filter=@roncal/photos-admin

# Deploy command
bunx wrangler deploy

# Path
apps/photos-admin
```

## Available scripts

```bash
bun run dev      # Start Vite dev server
bun run build    # Production build
bun run preview  # Preview built app with Wrangler Workers
bun run check    # TypeScript type check
```
