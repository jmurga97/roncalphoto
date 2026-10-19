import { createTRPCClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import { renderToStaticMarkup } from "react-dom/server";

import { DEFAULT_API_URL } from "../src/lib/api/config";
import { INITIAL_DATA_ELEMENT_ID } from "../src/lib/api/initial-data";
import { ASPECT_BUCKETS, MASONRY_COLUMN_WIDTH } from "../src/pages/canvas/constants";
import { buildCanvasWall, randomSeed } from "../src/pages/canvas/utils/canvas-wall";
import { computeContentBounds } from "../src/pages/canvas/utils/compute-canvas-layout";
import { StudioContent } from "../src/components/studio/studio-content";
import { SERVICES, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../src/lib/seo/content";
import { parseRichText, RichTextRenderer } from "../src/utils/render-rich-text";

import type { InitialData } from "../src/lib/api/initial-data";
import type { CanvasPlacement } from "../src/pages/canvas/types";
import type { AppRouter, Session } from "@roncal/api/router";
import type { RichTextInline } from "../src/utils/render-rich-text";

interface PhotosEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  API_URL?: string;
  CONTACT_EMAIL?: string;
  SERVICE_AREA?: string;
}

const PUBLIC_PATHS = ["/"];
const INDEX_RULES = "index, follow, max-image-preview:large";
const PRIVATE_RULES = "noindex, nofollow, noarchive";
const SESSION_PATH = /^\/session\/([^/]+)\/?$/;
const STUDIO_ID = `${SITE_URL}/#studio`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** What the worker puts in the HTML shell: `body` replaces the empty root for crawlers. */
interface Page {
  status: number;
  head: string;
  body?: string;
  indexable?: boolean;
}

function escapeMarkup(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function structuredData(path: string, env: PhotosEnv) {
  const provider = {
    "@type": "Organization",
    "@id": STUDIO_ID,
    name: "RoncalPhoto",
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    ...(env.CONTACT_EMAIL ? { email: env.CONTACT_EMAIL } : {}),
    ...(env.SERVICE_AREA ? { areaServed: env.SERVICE_AREA } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de fotografía",
      itemListElement: SERVICES.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.name,
          description: item.description,
          url: `${SITE_URL}/#servicios`,
        },
      })),
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      provider,
      { "@type": "WebSite", "@id": WEBSITE_ID, name: "RoncalPhoto", url: `${SITE_URL}/`, inLanguage: "es" },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${path}#page`,
        url: `${SITE_URL}${path}`,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: "es",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": STUDIO_ID },
      },
    ],
  };
}

interface MetaTags {
  title: string;
  description: string;
  url: string;
  data: unknown;
  image?: string;
}

function metaTags({ title, description, url, data, image }: MetaTags) {
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");
  const imageTags = image
    ? `<meta property="og:image" content="${escapeMarkup(image)}" />
    <meta name="twitter:image" content="${escapeMarkup(image)}" />`
    : "";

  return `<title>${escapeMarkup(title)}</title>
    <meta name="description" content="${escapeMarkup(description)}" />
    <link rel="canonical" href="${escapeMarkup(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="RoncalPhoto" />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:title" content="${escapeMarkup(title)}" />
    <meta property="og:description" content="${escapeMarkup(description)}" />
    <meta property="og:url" content="${escapeMarkup(url)}" />
    ${imageTags}
    <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />
    <meta name="twitter:title" content="${escapeMarkup(title)}" />
    <meta name="twitter:description" content="${escapeMarkup(description)}" />
    <script type="application/ld+json">${json}</script>`;
}

function homePage(path: string, env: PhotosEnv): Page {
  const location = env.SERVICE_AREA ? ` en ${env.SERVICE_AREA}` : "";
  const description = `${SITE_DESCRIPTION}${location ? ` Servicio${location}.` : ""}`;
  const head = metaTags({
    title: SITE_TITLE,
    description,
    url: `${SITE_URL}${path}`,
    data: structuredData(path, env),
  });
  const body = renderToStaticMarkup(
    <main>
      <h1 className="editorial-heading px-6 pt-8">RoncalPhoto · Estudio de fotografía</h1>
      <StudioContent email={env.CONTACT_EMAIL} area={env.SERVICE_AREA} />
    </main>,
  );

  return { status: 200, head, body, indexable: true };
}

function agentSummary(env: PhotosEnv) {
  return `# RoncalPhoto\n\n> ${SITE_DESCRIPTION}\n\n## Servicios\n\n${SERVICES.map(
    (service) => `- [${service.name}](${SITE_URL}/#servicios): ${service.description}`,
  ).join(
    "\n",
  )}\n\n## Portfolio y contacto\n\n- [Portfolio](${SITE_URL}/)\n- [Sobre mí](${SITE_URL}/#sobre-mi)\n- [Consulta de presupuesto](${SITE_URL}/#servicios)\n${env.CONTACT_EMAIL ? `- Email: ${env.CONTACT_EMAIL}\n` : ""}${env.SERVICE_AREA ? `- Zona de servicio: ${env.SERVICE_AREA}\n` : ""}\nLas condiciones, disponibilidad y precios se consultan para cada proyecto. Las entregas privadas a clientes no forman parte del portfolio público.\n`;
}

function apiClient(env: PhotosEnv) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${env.API_URL ?? DEFAULT_API_URL}/trpc`,
        fetch: (url, options) => fetch(url, { ...options, credentials: "omit", signal: AbortSignal.timeout(5000) }),
      }),
    ],
  });
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//.test(url);
}

function sessionUrl(session: Pick<Session, "slug">) {
  return `${SITE_URL}/session/${encodeURIComponent(session.slug)}`;
}

async function sitemapResponse(env: PhotosEnv) {
  try {
    const sessions = (await apiClient(env).sessions.canvas.query()).filter((session) => session.photos.length > 0);
    // Each photo is listed under the session page that shows it (max 1,000 images per <url>).
    const sessionEntries = sessions.map((session) => {
      const images = session.photos
        .map((photo) => photo.url)
        .filter(isAbsoluteUrl)
        .slice(0, 1000)
        .map((url) => `<image:image><image:loc>${escapeMarkup(url)}</image:loc></image:image>`)
        .join("");
      return `<url><loc>${escapeMarkup(sessionUrl(session))}</loc>${images}</url>`;
    });
    const entries = [...PUBLIC_PATHS.map((path) => `<url><loc>${SITE_URL}${path}</loc></url>`), ...sessionEntries];
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join("")}</urlset>`,
      { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    console.error("Could not load the public portfolio for the sitemap", error);
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "300", "Cache-Control": "no-store" },
    });
  }
}

function inlineText(nodes: RichTextInline[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return node.value;
      if (node.type === "break") return " ";
      return inlineText(node.children);
    })
    .join("");
}

function sessionDescription(session: Session) {
  const text = parseRichText(session.description)
    .flatMap((block) => ("items" in block ? block.items : [block.children]))
    .map(inlineText)
    .join(" ")
    .replaceAll(/\s+/g, " ")
    .trim();
  if (text.length === 0) return `${session.title}. ${SITE_DESCRIPTION}`;
  return text.length <= 160 ? text : `${text.slice(0, 159).replace(/\s+\S*$/, "")}…`;
}

function sessionStructuredData(session: Session, url: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": STUDIO_ID, name: "RoncalPhoto", url: `${SITE_URL}/` },
      { "@type": "WebSite", "@id": WEBSITE_ID, name: "RoncalPhoto", url: `${SITE_URL}/`, inLanguage: "es" },
      {
        "@type": "ImageGallery",
        "@id": `${url}#page`,
        url,
        name: session.title,
        description,
        inLanguage: "es",
        datePublished: session.createdAt,
        keywords: session.tags.map((tag) => tag.name).join(", "),
        isPartOf: { "@id": WEBSITE_ID },
        creator: { "@id": STUDIO_ID },
        image: session.photos
          .filter((photo) => isAbsoluteUrl(photo.url))
          .map((photo) => ({
            "@type": "ImageObject",
            contentUrl: photo.url,
            ...(isAbsoluteUrl(photo.miniature) ? { thumbnailUrl: photo.miniature } : {}),
            caption: photo.alt,
            ...(photo.about ? { description: photo.about } : {}),
            creator: { "@id": STUDIO_ID },
            creditText: "RoncalPhoto",
          })),
      },
    ],
  };
}

function SessionContent({ session }: { session: Session }) {
  return (
    <main className="px-6 py-8">
      <a href="/">RoncalPhoto · Portfolio</a>
      <h1 className="editorial-heading">{session.title}</h1>
      {session.tags.length > 0 ? (
        <ul aria-label="Tags">
          {session.tags.map((tag) => (
            <li key={tag.id}>{tag.name}</li>
          ))}
        </ul>
      ) : null}
      <div className="editorial-prose">
        <RichTextRenderer document={parseRichText(session.description)} />
      </div>
      {session.photos.map((photo) => (
        <figure key={photo.id}>
          <img alt={photo.alt} decoding="async" loading="lazy" src={photo.miniature} />
          {photo.about ? <figcaption>{photo.about}</figcaption> : null}
        </figure>
      ))}
    </main>
  );
}

async function loadSession(slug: string, env: PhotosEnv) {
  try {
    return await apiClient(env).sessions.get.query({ slug });
  } catch (error) {
    // An invalid slug fails input validation: for the visitor it is the same missing page.
    const code = error instanceof TRPCClientError ? (error as TRPCClientError<AppRouter>).data?.code : undefined;
    if (code === "NOT_FOUND" || code === "BAD_REQUEST") return null;
    throw error;
  }
}

async function sessionPage(slug: string, env: PhotosEnv): Promise<Page | undefined> {
  let session: Session | null;
  try {
    session = await loadSession(slug, env);
  } catch (error) {
    // The SPA shell still loads (and shows its own error state); crawlers are asked to come back.
    console.error("Could not load the session page", error);
    return { status: 503, head: "<title>Sesión de fotos | RoncalPhoto</title>" };
  }
  // Empty sessions have no stage to open: the client sends them to the canvas.
  if (!session || session.photos.length === 0) return undefined;

  const url = sessionUrl(session);
  const description = sessionDescription(session);
  const head = metaTags({
    title: `${session.title} | RoncalPhoto`,
    description,
    url,
    data: sessionStructuredData(session, url, description),
    image: session.photos.map((photo) => photo.url).find(isAbsoluteUrl),
  });

  return { status: 200, head, body: renderToStaticMarkup(<SessionContent session={session} />), indexable: true };
}

async function pageFor(path: string, env: PhotosEnv): Promise<Page | undefined> {
  if (PUBLIC_PATHS.includes(path)) return homePage(path, env);
  if (path.startsWith("/delivery/")) return { status: 200, head: "<title>Entrega privada | RoncalPhoto</title>" };
  const slug = SESSION_PATH.exec(path)?.[1];
  return slug ? sessionPage(slug, env) : undefined;
}

const TALLEST_TILE = MASONRY_COLUMN_WIDTH / Math.min(...ASPECT_BUCKETS);
const OPENING_SEED_ATTEMPTS = 24;

/**
 * Picks the wall's shuffle so the tile at its centre, where the opening view is centred, is a portrait: the
 * largest tile size, so the LCP element on any viewport. Its photo can then be preloaded from the HTML.
 */
function openingWall(canvas: Session[]) {
  let best = { seed: 0, height: 0, src: "" };

  for (let attempt = 0; attempt < OPENING_SEED_ATTEMPTS && best.height < TALLEST_TILE; attempt += 1) {
    const seed = randomSeed();
    const { items, placements } = buildCanvasWall(canvas, seed);
    const bounds = computeContentBounds(placements);
    const distance = ({ x, y, width, height }: CanvasPlacement) =>
      Math.hypot(x + width / 2 - (bounds.minX + bounds.maxX) / 2, y + height / 2 - (bounds.minY + bounds.maxY) / 2);
    const centre = placements.reduce((nearest, placement) =>
      distance(placement) < distance(nearest) ? placement : nearest,
    );
    const src = items.find((item) => item.id === centre.photoId)?.miniatureSrc ?? "";

    if (centre.height > best.height) best = { seed, height: centre.height, src };
  }

  return best;
}

/** The canvas queries inlined for the first render, plus early connections to the photo hosts it loads first. */
async function canvasHead(env: PhotosEnv, preloadCentre: boolean) {
  try {
    const api = apiClient(env);
    const [canvas, list] = await Promise.all([api.sessions.canvas.query(), api.sessions.list.query()]);
    const data: InitialData = { canvas, list };
    const imageOrigins = new Set(
      canvas
        .flatMap((session) => session.photos.map((photo) => photo.miniature))
        .filter(isAbsoluteUrl)
        .map((url) => new URL(url).origin),
    );
    const preconnects = [...imageOrigins]
      .slice(0, 3)
      .map((origin) => `<link rel="preconnect" href="${escapeMarkup(origin)}" />`)
      .join("");
    const json = JSON.stringify(data).replaceAll("<", "\\u003c");
    const opening = canvas.some((session) => session.photos.length > 0) ? openingWall(canvas) : undefined;
    const preload =
      preloadCentre && opening?.src
        ? `<link rel="preload" as="image" href="${escapeMarkup(opening.src)}" fetchpriority="high" />`
        : "";
    const seed = opening ? ` data-canvas-seed="${opening.seed}"` : "";

    return `${preconnects}${preload}<script id="${INITIAL_DATA_ELEMENT_ID}"${seed} type="application/json">${json}</script>`;
  } catch (error) {
    // The client fetches the data itself: at least open that connection early.
    console.error("Could not inline the canvas data", error);
    return `<link rel="preconnect" href="${escapeMarkup(env.API_URL ?? DEFAULT_API_URL)}" crossorigin />`;
  }
}

const STYLESHEET_LINK = /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/;

/** The stylesheet (~12 KB gzipped) inlined, so the first paint does not wait on a second request. */
async function inlineStylesheet(html: string, request: Request, env: PhotosEnv) {
  const link = STYLESHEET_LINK.exec(html);
  if (!link) return html;

  const response = await env.ASSETS.fetch(new Request(new URL(link[1], request.url)));
  const css = response.ok ? await response.text() : "";
  // Font URLs in it are root-relative, so they resolve the same from the page.
  return css && !css.includes("</style") ? html.replace(link[0], `<style>${css}</style>`) : html;
}

async function htmlResponse(request: Request, env: PhotosEnv, path: string) {
  const template = await env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
  if (!template.ok) return template;

  const showsCanvas = PUBLIC_PATHS.includes(path) || SESSION_PATH.test(path);
  const [found, canvasMarkup] = await Promise.all([
    pageFor(path, env),
    showsCanvas ? canvasHead(env, PUBLIC_PATHS.includes(path)) : "",
  ]);
  const page = found ?? {
    status: 404,
    head: "<title>Página no encontrada | RoncalPhoto</title>",
    body: '<main class="p-8"><h1>Página no encontrada</h1><a href="/">Volver al portfolio</a></main>',
  };
  const isPrivate = path.startsWith("/delivery/");
  const isCanonicalHost = new URL(request.url).hostname === new URL(SITE_URL).hostname;
  const robots = page.indexable && isCanonicalHost ? INDEX_RULES : PRIVATE_RULES;
  let html = (await inlineStylesheet(await template.text(), request, env))
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta\s+name="description"[^>]*>/, "")
    .replace(
      "</head>",
      `${page.head}${page.status === 200 ? canvasMarkup : ""}<meta name="robots" content="${robots}" /></head>`,
    );

  if (page.status === 404) {
    html = html
      .replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g, "")
      .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, "");
  }
  if (page.body) {
    html = html.replace(
      '<div id="root" class="h-full"></div>',
      // Crawler-only markup: visible, it flashes on slow phones until React replaces the root.
      page.status === 404 ? page.body : `<div id="root" class="h-full"><div class="sr-only">${page.body}</div></div>`,
    );
  }

  return new Response(html, {
    status: page.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": isPrivate ? "private, no-store" : page.status === 200 ? "public, max-age=300" : "no-store",
      "X-Robots-Tag": robots,
      ...(page.status === 503 ? { "Retry-After": "300" } : {}),
      ...(isPrivate ? { "Referrer-Policy": "no-referrer" } : {}),
    },
  });
}

export default {
  async fetch(request: Request, env: PhotosEnv) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const url = new URL(request.url);
    const { pathname } = url;
    const canonicalHost = new URL(SITE_URL).hostname;
    if (url.hostname === `www.${canonicalHost}` || (url.hostname === canonicalHost && url.protocol === "http:")) {
      return Response.redirect(`${SITE_URL}${pathname}${url.search}`, 301);
    }
    if (
      pathname === "/servicios" ||
      pathname === "/servicios/" ||
      SERVICES.some(({ slug }) => pathname === `/servicios/${slug}` || pathname === `/servicios/${slug}/`)
    ) {
      return Response.redirect(new URL("/#servicios", url).href, 302);
    }
    if (pathname === "/robots.txt") {
      const rules = url.hostname === canonicalHost ? `Allow: /\n\nSitemap: ${SITE_URL}/sitemap.xml` : "Disallow: /";
      return new Response(`User-agent: *\n${rules}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    if (pathname === "/sitemap.xml") return sitemapResponse(env);
    // Merged into /sitemap.xml; kept so a sitemap registered in Search Console still resolves.
    if (pathname === "/image-sitemap.xml") return Response.redirect(`${SITE_URL}/sitemap.xml`, 301);
    if (pathname === "/llms.txt") {
      return new Response(agentSummary(env), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    if (pathname === "/index.html") return Response.redirect(`${SITE_URL}/`, 301);
    if (pathname.includes(".") && !pathname.startsWith("/delivery/") && !pathname.startsWith("/session/")) {
      const asset = await env.ASSETS.fetch(request);
      if (!asset.headers.get("Content-Type")?.includes("text/html")) return asset;
    }
    return htmlResponse(request, env, pathname);
  },
};
