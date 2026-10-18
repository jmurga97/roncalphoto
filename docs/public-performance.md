# Public app performance

Measured locally on 2026-10-18 with Lighthouse 13.5.0, its default mobile profile and
`--preset=desktop`. No production domain is configured yet.

| Page                       | Mobile performance | Desktop performance | Mobile LCP | Desktop LCP |
| -------------------------- | ------------------ | ------------------- | ---------- | ----------- |
| Canvas `/`                 | 91                 | 100                 | 3.2 s      | 0.8 s       |
| Selected photo `/?photo=…` | 82                 | 98                  | 4.6 s      | 1.1 s       |

These are single-run lab results, not production guarantees. The preview used a production
Vite build, compressed JavaScript/CSS, a deterministic 48-photo fixture across three sessions,
and a 150 ms API delay. Test photos were encoded with the image worker's current settings:
1920 px WebP at quality 85 and 480 px WebP at quality 80. Each photo had its own URL.
The selected test image was about 306 KiB; real photos will produce different results.
The fixture API replaced the unavailable production API. Worker HTML/SEO responses and
Cloudflare caching were not part of this measurement.

## Implemented

- Load canvas data in the route loader alongside the sidebar query, then preload a directly
  selected photo before rendering the wall.
- Load canvas thumbnails through one IntersectionObserver with a 200 px margin. Keep loaded
  tiles available while panning; defer unloaded tiles while the photo viewer covers the wall.
- Request the selected full-size photo eagerly with high priority. Prepare adjacent full-size
  slides and keep visited slides mounted so scrolling never swaps image sources or sizes.
  Unvisited distant slides keep their scroll positions without downloading images.
- Fade back from a direct photo link when its canvas tile has not loaded yet.
- Preload the two self-hosted fonts.
- Preserve URL validation while removing its runtime Zod import and forced bundle chunk entry:
  about 61 kB less JavaScript, or 16 kB compressed.

The selected-photo run downloaded one full-size image on entry. After fixing photo navigation
stutter, entry now requests the selected image and its immediate neighbors (at most three
full-size images). The earlier implementation requested 8–11 full-size images in the local
fixture. No image quality settings were changed.

## Remaining mobile limit

The image worker currently generates only `main` (1920 px) and `thumbnail` (480 px).
A medium variant, for example 960 px, plus intrinsic image dimensions would allow accurate
`srcset`/`sizes` selection. This requires an image-worker/API change and a plan for existing
uploads. Do not advertise nonexistent variants or use thumbnails as the selected full-size photo.

## Repeat against real data

Build with `VITE_API_URL` set to the API serving your photos. Audit the production preview or
a deployed URL, not the Vite development server. Check both `/` and a direct `/?photo=…` link:

```sh
bunx lighthouse <url> --only-categories=performance --chrome-flags='--headless=new' --output=html
bunx lighthouse <url> --preset=desktop --only-categories=performance --chrome-flags='--headless=new' --output=html
```

Run each profile three times and compare medians with the same photo set and image encoding.
Mobile emulation does not replace checking pan, zoom and scrolling on a physical phone.
