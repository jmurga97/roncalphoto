// Dev-only API fixtures for the "Demo data / Worst case" toggle (`?data=worst|empty|one|huge`).
// Shaped exactly like the router outputs; answered at the frontends' tRPC fetch, so components
// see them through the same boundary as real data. Never imported by the Worker.
//
// Worst case is realistic, not random: the schema has no length limits on any text column
// (sessions.title/description, photos.alt/about, tags.name, deliveries.title), so long values are
// long-but-plausible. Failures are spread across rows, as real data does.

import type { RouterOutputs, Session, Tag } from "../src/trpc/router";

export type DataMode = "demo" | "worst" | "empty" | "one" | "huge";

type Photo = Session["photos"][number];
type Delivery = RouterOutputs["clientDeliveries"]["get"];
type DeliveryPhoto = Delivery["photos"][number];
interface Dataset {
  sessions: Session[];
  tags: Tag[];
  delivery: Delivery;
}

const NO_METADATA = { iso: 0, aperture: "", shutterSpeed: "", lens: "", camera: "" };
const META = { iso: 400, aperture: "f/2.8", shutterSpeed: "1/250", lens: "XF 56mm F1.2 R WR", camera: "Fujifilm X-T5" };
// Deleted R2 object: the URL is valid, the image is gone.
const BROKEN_URL = "https://pub-roncalphoto.r2.dev/photos/2026/06/deleted-original.jpg";

function picsum(seed: string, width: number, height: number) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Bulk rows use an inline SVG so the 1,000-row states don't hammer an image host.
function placeholder(index: number, width = 400, height = 300) {
  const shade = 40 + ((index * 37) % 120);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="rgb(${shade},${shade},${shade + 10})"/></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
}

function tag(name: string, slug = slugify(name)): Tag {
  return { id: `tag-${slug}`, name, slug };
}

function photo(sessionId: string, index: number, values: Partial<Photo> = {}): Photo {
  return {
    id: `${sessionId}-photo-${index + 1}`,
    sessionId,
    url: placeholder(index, 1600, 1067),
    miniature: placeholder(index),
    alt: `DSC_${String(4821 + index).padStart(4, "0")}`,
    about: "Selección final de la sesión.",
    sortOrder: index,
    metadata: META,
    ...values,
  };
}

function session(id: string, values: Omit<Session, "id" | "slug" | "photos"> & { photos?: Photo[] }): Session {
  return {
    id,
    slug: slugify(values.title) || id,
    photos: [],
    ...values,
    tags: values.tags.toSorted((a, b) => a.name.localeCompare(b.name)),
  };
}

const TAGS = [
  tag("Boda"),
  tag("B/N", "bn"),
  tag("Arquitectura y espacios interiores"),
  tag("Fotografía de producto para e-commerce"),
  tag("Conciertos 🎸", "conciertos"),
  tag("Retrato"),
  tag("Moda"),
  tag("Gastronomía"),
  tag("Eventos corporativos"),
  tag("Viajes"),
  tag("Paisaje"),
  tag("Larga exposición"),
  tag("Astrofotografía"),
  tag("東京", "tokyo"),
  tag("Newborn"),
  tag("Bodas destino — Costa Amalfitana"),
].toSorted((a, b) => a.name.localeCompare(b.name));

const byName = (name: string) => TAGS.find((item) => item.name === name) ?? TAGS[0];

const LONG_DESCRIPTION = [
  "<p>Tres días de boda entre <strong>Haro</strong>, <em>Nájera</em> y Logroño &amp; alrededores, con ceremonia civil en el claustro y banquete al aire libre hasta las cinco de la mañana. Galería para invitados: https://www.instagram.com/p/C8xZr2VNk3P/?utm_source=ig_web_copy_link&amp;igsh=MzRlODBiNWFlZA==</p>",
  "<h3>Créditos</h3>",
  "<ul><li>Vestido: Atelier Pronovias Barcelona</li><li>Floristería: Flores Martínez-Ugarte e Hijos, S.L.</li><li>Catering: Bodegas Muga · menú degustación de nueve pases con maridaje</li></ul>",
  "<p>**Nota:** las fotos del cóctel se entregan en un segundo lote.</p>",
].join("");

function weddingPhotos(sessionId: string): Photo[] {
  return [
    photo(sessionId, 0, {
      alt: "Novios saliendo de la iglesia bajo una lluvia de arroz y pétalos de rosa mientras los invitados aplauden en la escalinata principal",
      about:
        "Salida de la iglesia de Santa María la Redonda. Disparado desde lo alto de la escalinata con el 16 mm para meter a los ciento ochenta invitados en el encuadre; la luz de las siete y media de la tarde entraba rasante por la calle Portales y los pétalos se quedaron suspendidos el tiempo justo para congelarlos a 1/2000. Es la foto que los novios eligieron para la invitación del aniversario.",
      url: picsum("roncal-worst-pano", 2400, 360),
      miniature: picsum("roncal-worst-pano", 600, 90),
      metadata: {
        iso: 102_400,
        aperture: "f/1.2",
        shutterSpeed: "1/8000",
        lens: "Sony FE 24-70mm F2.8 GM II + Metabones Speed Booster Ultra",
        camera: "Hasselblad X2D 100C",
      },
    }),
    photo(sessionId, 1, {
      alt: "IMG_20260614_183245_HDR_Edited_Final_Final2_ForPrint_300dpi",
      url: picsum("roncal-worst-tall", 600, 2400),
      miniature: picsum("roncal-worst-tall", 100, 400),
    }),
    photo(sessionId, 2, { alt: "Detalle de los anillos", url: BROKEN_URL, miniature: BROKEN_URL }),
    photo(sessionId, 3, {
      alt: "👰‍♀️🤵‍♂️ Primer baile",
      url: picsum("roncal-worst-dance", 1600, 1067),
      miniature: picsum("roncal-worst-dance", 400, 267),
      metadata: NO_METADATA,
    }),
    photo(sessionId, 4, {
      alt: "Mesa",
      url: picsum("roncal-worst-table", 1600, 1600),
      miniature: picsum("roncal-worst-table", 400, 400),
      metadata: { ...META, shutterSpeed: "Bulb 4m 32s" },
    }),
  ];
}

function worstSessions(): Session[] {
  const wedding = "s-wedding";
  const catalogue = "s-catalogue";

  return [
    session(wedding, {
      title:
        "Boda de María del Carmen Fernández-Villaverde y Bartholomew Fitzgerald en el Monasterio de Santa María la Real de Nájera",
      description: LONG_DESCRIPTION,
      // CURRENT_TIMESTAMP from D1: UTC, no "T", no "Z".
      createdAt: "2026-05-20 23:45:00",
      tags: [byName("Boda"), byName("Bodas destino — Costa Amalfitana")],
      photos: weddingPhotos(wedding),
    }),
    session("s-jo", {
      title: "Jo",
      description: "Jo.",
      createdAt: "2026-05-18 10:00:00",
      tags: [byName("Retrato")],
      photos: [
        photo("s-jo", 0, {
          alt: "Jo",
          url: picsum("roncal-worst-jo", 1067, 1600),
          miniature: picsum("roncal-worst-jo", 267, 400),
        }),
      ],
    }),
    session("s-workshop", {
      title: "Workshop_FotografiaNocturna_2026_PirineoNavarro_ValleDelRoncal_GrupoB",
      description: "Salida nocturna del taller.",
      createdAt: "2026-05-02 21:00:00",
      tags: TAGS.slice(0, 12),
      photos: [
        photo("s-workshop", 0, {
          url: picsum("roncal-worst-night", 1600, 1067),
          miniature: picsum("roncal-worst-night", 400, 267),
        }),
      ],
    }),
    session("s-empty", {
      title: "Sesión en preparación",
      description: "Pendiente de selección.",
      createdAt: "2026-04-28 09:00:00",
      tags: [byName("Moda")],
    }),
    session("s-tokyo", {
      title: "東京の夜 — Tokyo by night",
      description: "<p>新宿、渋谷、そして浅草。雨の夜の三日間。</p>",
      createdAt: "2026-04-11 13:00:00",
      tags: [byName("東京"), byName("Viajes"), byName("Larga exposición")],
      photos: [
        photo("s-tokyo", 0, {
          alt: "渋谷スクランブル交差点、雨の夜",
          url: picsum("roncal-worst-tokyo", 1600, 1067),
          miniature: picsum("roncal-worst-tokyo", 400, 267),
        }),
      ],
    }),
    session("s-marrakech", {
      title: "Marrakech · ليالي مراكش",
      description: '<p dir="auto">ساحة جامع الفنا عند الغروب.</p>',
      createdAt: "2026-03-30 18:00:00",
      tags: [byName("Viajes")],
      photos: [
        photo("s-marrakech", 0, {
          alt: "ساحة جامع الفنا",
          url: picsum("roncal-worst-mkc", 1600, 1067),
          miniature: picsum("roncal-worst-mkc", 400, 267),
        }),
      ],
    }),
    session("s-surf", {
      title: "🌊 Surf en Mundaka 🏄‍♀️",
      description: "Ola izquierda, marea baja.",
      createdAt: "2026-03-01 08:00:00",
      tags: [byName("Paisaje"), byName("Conciertos 🎸")],
      photos: [
        photo("s-surf", 0, {
          url: picsum("roncal-worst-surf", 1600, 1067),
          miniature: picsum("roncal-worst-surf", 400, 267),
        }),
      ],
    }),
    session(catalogue, {
      title: "Catálogo primavera-verano",
      description: "Producto sobre fondo blanco.",
      createdAt: "2026-02-14 12:00:00",
      tags: [byName("Fotografía de producto para e-commerce"), byName("Moda")],
      photos: Array.from({ length: 240 }, (_, index) => photo(catalogue, index)),
    }),
  ];
}

function deliveryPhoto(index: number, values: Partial<DeliveryPhoto> = {}): DeliveryPhoto {
  return {
    id: `delivery-photo-${index + 1}`,
    url: placeholder(index, 1600, 1067),
    title: `DSC_${String(6001 + index).padStart(4, "0")}.jpg`,
    takenAt: "2026-06-14 18:32:45",
    sizeBytes: 8_421_003 + index * 7919,
    sortOrder: index,
    ...values,
  };
}

function worstDelivery(): Delivery {
  const photos = [
    deliveryPhoto(0, {
      title: "IMG_20260614_183245_HDR_Edited_Final_Final2_ForPrint_300dpi.jpg",
      sizeBytes: 187_654_321,
      url: picsum("roncal-worst-d1", 2400, 1600),
    }),
    deliveryPhoto(1, {
      title: "DSC_0001-Editado-final-v3 (copia).jpg",
      sizeBytes: 26_214_400,
      url: picsum("roncal-worst-d2", 1600, 2400),
    }),
    deliveryPhoto(2, { title: "Ceremonia", sizeBytes: 0, url: BROKEN_URL }),
    deliveryPhoto(3, { title: "Primer baile 💃🕺", sizeBytes: 1023, url: picsum("roncal-worst-d4", 2400, 360) }),
    ...Array.from({ length: 182 }, (_, index) => deliveryPhoto(index + 4)),
  ];

  return {
    id: "delivery-worst",
    token: "worst",
    title: "Boda de Íñigo Ibáñez y Begoña Muñoz-Echeverría · Ceremonia, cóctel y banquete en el Palacio de Ezpeleta",
    photosAvailable: true,
    photos,
  };
}

function hugeDataset(): Dataset {
  const tags = Array.from({ length: 40 }, (_, index) => tag(`Etiqueta ${index + 1}`));
  const sessions = Array.from({ length: 300 }, (_, index) => {
    const id = `s-huge-${index + 1}`;

    return session(id, {
      title: `Sesión ${index + 1}`,
      description: "Sesión generada.",
      createdAt: `2025-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")} 12:00:00`,
      tags: [tags[index % tags.length], tags[(index * 7) % tags.length]].filter(
        (item, i, all) => all.indexOf(item) === i,
      ),
      photos: Array.from({ length: 20 }, (_, photoIndex) => photo(id, photoIndex)),
    });
  });
  const photos = Array.from({ length: 1000 }, (_, index) => deliveryPhoto(index));

  return {
    sessions,
    tags,
    delivery: { id: "delivery-huge", token: "huge", title: "Entrega", photosAvailable: true, photos },
  };
}

function oneDataset(): Dataset {
  const single = tag("Retrato");
  const only = session("s-one", {
    title: "Retratos de estudio",
    description: "Luz suave y fondos neutros.",
    createdAt: "2026-04-12 17:30:00",
    tags: [single],
    photos: [
      photo("s-one", 0, {
        url: picsum("roncal-portrait-1", 1067, 1600),
        miniature: picsum("roncal-portrait-1", 267, 400),
      }),
    ],
  });

  return {
    sessions: [only],
    tags: [single],
    delivery: {
      id: "delivery-one",
      token: "one",
      title: "Boda Ana y Luis",
      photosAvailable: true,
      photos: [deliveryPhoto(0)],
    },
  };
}

function buildDataset(mode: Exclude<DataMode, "demo">): Dataset {
  switch (mode) {
    case "worst":
      return { sessions: worstSessions(), tags: TAGS, delivery: worstDelivery() };
    case "empty":
      return {
        sessions: [],
        tags: [],
        delivery: { id: "delivery-empty", token: "empty", title: "Boda Ana y Luis", photosAvailable: true, photos: [] },
      };
    case "one":
      return oneDataset();
    case "huge":
      return hugeDataset();
  }
}

class FixtureNotFound extends Error {}

function found<T>(value: T | undefined): T {
  if (value === undefined) throw new FixtureNotFound();
  return value;
}

type Resolver = (data: Dataset, input: Record<string, string>) => unknown;

const RESOLVERS: Record<string, Resolver> = {
  "sessions.list": (data) =>
    data.sessions.map(({ photos, ...session }) => ({
      ...session,
      firstPhotoId: photos[0]?.id,
      photoCount: photos.length,
    })),
  "sessions.canvas": (data) => data.sessions,
  "sessions.get": (data, input) => found(data.sessions.find((item) => item.slug === input.slug)),
  "photos.list": (data, input) => {
    const search = String(input.search ?? "").toLowerCase();
    const matching = search
      ? data.sessions.flatMap((session) =>
          session.photos.filter((photo) =>
            `${photo.alt} ${photo.about} ${photo.url} ${session.title}`.toLowerCase().includes(search),
          ),
        )
      : data.sessions.flatMap((session) => session.photos);
    const offset = Number(input.offset ?? 0);
    const limit = Number(input.limit ?? 50);

    return { items: matching.slice(offset, offset + limit), total: matching.length };
  },
  "photos.get": (data, input) =>
    found(data.sessions.flatMap((item) => item.photos).find((item) => item.id === input.id)),
  "tags.list": (data) => data.tags,
  "tags.get": (data, input) => {
    const match = found(data.tags.find((item) => item.slug === input.slug));

    return { tag: match, sessions: data.sessions.filter((item) => item.tags.some((t) => t.id === match.id)) };
  },
  // Any token resolves: the toggle is about the data, not the link.
  "clientDeliveries.get": (data) => data.delivery,
};

let cached: { mode: DataMode; data: Dataset } | undefined;

/**
 * Answers a tRPC batch GET (`/trpc/a,b?batch=1&input={…}`) from the fixture for `mode`.
 * Returns null (use the real API) in demo mode, for mutations, or for procedures it doesn't know.
 */
export function fixtureResponse(mode: DataMode, url: RequestInfo | URL): Response | null {
  if (mode === "demo") return null;

  const { pathname, searchParams } = new URL(url instanceof Request ? url.url : url);
  const paths = pathname.replace(/^.*\/trpc\//, "").split(",");

  if (!paths.every((path) => path in RESOLVERS)) return null;

  if (cached?.mode !== mode) cached = { mode, data: buildDataset(mode) };

  const data = cached.data;
  const inputs = JSON.parse(searchParams.get("input") ?? "{}") as Record<string, Record<string, string>>;
  const results = paths.map((path, index) => {
    try {
      return { result: { data: RESOLVERS[path](data, inputs[index] ?? {}) } };
    } catch {
      return { error: { message: "Not found", code: -32_004, data: { code: "NOT_FOUND", httpStatus: 404, path } } };
    }
  });

  return Response.json(results, { status: results.some((item) => "error" in item) ? 207 : 200 });
}
