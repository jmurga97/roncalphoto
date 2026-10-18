# Public search and discovery

The canonical site is `https://mariagabrielaroncalescalante.com`. Business copy and service slugs
live in `apps/photos/src/lib/seo/content.ts`. The public Cloudflare Worker in
`apps/photos/worker/index.tsx` renders the homepage fallback into the built Vite HTML, using the
same `StudioContent` as the interactive portfolio. Every visitor receives the same HTML regardless
of user agent. The homepage then loads the interactive portfolio; without JavaScript, the studio
copy and contact link remain readable. No additional dependency or database migration is required.

## Pages and search intent

The canonical homepage `/` contains the photographer introduction and five photography specialties:
weddings, events, real estate, architecture/interiors and lifestyle. The sidebar's “Sobre mí” and
“Servicios” buttons open the matching section in the shared panel; text appears after the expansion,
with reduced-motion support. `/#sobre-mi`, `/#servicios` and the legacy `/#estudio` open it directly.

Separate service pages are postponed. `/servicios/` and the five known service URLs (with or without
a trailing slash) temporarily redirect (302) to `/#servicios`. Unknown service paths still return 404.
JSON-LD and `/llms.txt` point to the studio instead of unpublished pages. The homepage has Spanish
headings, title and description, canonical URL, Open Graph and Twitter metadata, and JSON-LD
for the organization and its actual services. No invented address, prices, ratings, opening hours
or location claims are published.

`/sitemap.xml` lists only the canonical homepage, independently of API availability.
`/image-sitemap.xml` lists the public portfolio image URLs. Portfolio `?photo=` and `?tag=` views canonicalize
to `/`; existing `/session/:slug` links keep their canvas behavior and are excluded from indexing
and the sitemap. Image sitemap entries come from the same public `sessions.canvas` tRPC query used by the
gallery. Image URLs are deduplicated, XML-escaped, and attached to the canonical homepage, with
the sitemap limit of 1,000 images per page. Above that, introduce stable public gallery URLs and
split image entries between those pages. Client delivery data is never queried. If the public API
is unavailable, the image sitemap returns 503 with a retry hint instead of publishing incomplete data.

`/robots.txt` permits public crawling, including search agents covered by `User-agent: *`, and
announces the sitemap. Client delivery URLs are not linked or listed. Their responses have
`noindex, nofollow, noarchive`, `private, no-store`, and `Referrer-Policy: no-referrer`; crawling
is allowed so crawlers can see the indexing restriction. This does not replace the existing secret
delivery tokens. Admin HTML and static response headers also prohibit indexing.

`/llms.txt` is a concise directory of real services and contact details. It is supplementary;
it is not an indexing requirement and does not promise visibility in AI answers.
Unknown page routes return HTTP 404. The Worker redirects `www`, HTTP on the canonical host,
and known service URLs to the studio. Other hosts, including previews, return `noindex`
and disallow crawling. Keep the production custom domain connected to this Worker in Cloudflare.

## Contact and local search

The confirmed public contact, `mariagabrielaroncal@gmail.com`, is configured in
`apps/photos/wrangler.toml` under `[vars]`. Public Worker settings:

- `CONTACT_EMAIL`: customer-facing email for the server-rendered studio, JSON-LD and `/llms.txt`.
  The interactive studio uses the confirmed public email in `src/lib/seo/content.ts`; keep it
  aligned with the Worker variable. Do not use the admin login address as the public contact.
- `SERVICE_AREA`: the actual city or region served. Appears in the server-rendered studio copy,
  description, structured data and `/llms.txt`.

The Worker uses `API_URL` for its image sitemap query, defaulting to the configured public API
Worker `https://roncalphoto-api.murgapja-fee.workers.dev`, shared with the public app’s production
fallback in `src/lib/api/config.ts`. If the
frontend uses a different `VITE_API_URL`, set the matching public `API_URL` Worker variable.

The service area has not been supplied, so geographic claims are omitted. Quote links open the
visitor’s email application; no enquiry is stored or sent by the website itself. Keep the service
wording accurate; edit `content.ts` if coverage or deliverables change.

## Preview and verification

```bash
bun run build
bun run --cwd apps/photos preview
# Wrangler serves the built app and the SEO routes at http://localhost:8787 by default.
# Vite dev serves the portfolio SPA; use Wrangler to inspect studio HTML and response headers.
```

Check source HTML with JavaScript disabled, titles/canonicals/JSON-LD, the sitemap, redirects,
mobile scrolling, themes, quote links, and the private delivery response headers. Repository gates:
`bun run check`, `bun run lint`, `bun run build`. A deploy dry run from `apps/photos` checks Worker
bundling as well: `bunx wrangler deploy --dry-run`.

## Launch follow-up

1. Deploy the current API first, then the public and admin Workers after review. The current
   deployed API answers `/health` but does not yet expose the repository’s tRPC endpoints; until
   that API is deployed, the image sitemap returns 503 and the interactive gallery cannot load
   live data. The previous public API default, `api.murga.ing`, did not resolve during verification.
   The API CORS allowlist now includes the confirmed public domain and its `www` alias. Existing production content is not changed
   just by editing this repository.
2. Verify domain ownership in Google Search Console and Bing Webmaster Tools, submit
   `https://mariagabrielaroncalescalante.com/sitemap.xml` and
   `https://mariagabrielaroncalescalante.com/image-sitemap.xml`, and inspect the live homepage and studio.
3. Verify the image/CDN domain in Search Console as well, and make sure its crawling rules allow
   the public portfolio images. Image metadata and private delivery indexing restrictions are
   separate concerns.
4. Validate JSON-LD with Schema.org's validator and inspect Google-rendered HTML. Organization and
   Service markup communicates the business; it does not guarantee a Google rich result.
5. Confirm that Cloudflare bot/WAF settings allow verified search crawlers. Application robots rules
   cannot override an edge firewall or a managed AI crawler block.
6. Set up or update a Google Business Profile using the real service area, public contact and
   eligible business details. Keep those details consistent with the website.
7. Maintain real, descriptive photo alt text and session descriptions in the admin. Filenames alone
   are not useful descriptions. Publish examples of the work, with permission, as projects develop.
8. Track search impressions, studio enquiries and qualified enquiries before deciding whether
   additional location pages, analytics or booking software are needed. Rankings and sales are not guaranteed.

References: [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[AI features and websites](https://developers.google.com/search/docs/appearance/ai-features),
[supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags).
