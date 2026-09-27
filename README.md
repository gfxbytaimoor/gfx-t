# GFX-T — Creative Agency Website

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · GSAP (ScrollTrigger, SplitText, DrawSVG, Flip) · Lenis · React Three Fiber.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/ (what Cloudflare Pages serves)
npm start          # preview out/ locally, resolved the way Pages does
npm run lint
npm run typecheck
npm run images     # optimise client-supplied images (see below)
```

The production domain is `https://gfx-t.com` (set in `src/lib/site.ts`); it drives canonical URLs, the sitemap, robots.txt and Open Graph tags. Set `NEXT_PUBLIC_SITE_URL` only to override it (e.g. a staging deploy). Redirect `www.gfx-t.com` to `gfx-t.com` at the host so there is one canonical address.

## Deploying (Cloudflare Pages, free plan)

The site is a static export (`output: "export"`): `npm run build` writes plain files to `out/`, no server needed. In Cloudflare Pages → Create → Connect to Git → this repo:

- **Build command:** `npm run build` · **Build output directory:** `out` · **Production branch:** `main`
- Node version comes from `.node-version` (22). No environment variables are required.
- **Cloudflare Workers instead of Pages** (deploy command `npx wrangler deploy`): `wrangler.jsonc` uploads `out/` as static assets. Keep that file — without it Wrangler tries to convert the project to OpenNext, which fails on a static export.

Every push to `main` redeploys. To serve the apex `gfx-t.com`, the domain must be a zone on the same Cloudflare account (move the nameservers from Hostinger); then add `gfx-t.com` and `www.gfx-t.com` under the project's Custom domains and redirect www to the apex. Copy the mail records (MX, SPF, DKIM, DMARC) into Cloudflare DNS before switching nameservers.

**Images.** A static host has no image-optimisation server, so `scripts/image-variants.mjs` pre-builds every image in `public/brand`, `public/team` and `public/portfolio` at each width in `scripts/image-widths.json` (quality 90 WebP, into git-ignored `public/_img`), and `src/lib/image-loader.ts` points `next/image` at them. It runs automatically before `dev` and `build`, and after the build it fails the build if any referenced image is missing. `scripts/fix-export-segments.mjs` corrects a Windows-only Next.js export bug in prefetch file names (a no-op on Linux, including Cloudflare's build).

## Creative system

- **Concept — "Anchor → Path → Form".** The logo's pen-tool nib is the visual language: anchor points, Bézier handles, and one *selected* path. The hero field scatters (Create), orders into paths (Strategize) and lifts into the nib (Elevate); the closing CTA and Contact page re-form the same nib so the site ends where it began.
- **Colour rule.** Ink `#181818` / signal yellow `#FFBF01` from the logo, warm paper `#F3F0E8`. Yellow means *selected* — the current page, the active item, the one primary action. Never yellow text on paper. Tokens live in `src/app/globals.css`.
- **Type.** Archivo (variable width axis used expressively), Inter for body, JetBrains Mono for labels.
- **Motion.** One easing pair (`gfx.out`, `gfx.inOut`) and duration scale in `src/lib/motion.ts`. All motion is disabled under `prefers-reduced-motion`; content never depends on it.

## Structure

```
src/
  app/                 routes, metadata, sitemap, robots, OG image
  components/
    sections/home/     Hero, AboutTeaser, ServicesTeaser, ClientsTeaser, WhyChooseUs, ClosingCta
    sections/shared/   VisionMission, GrowthPath (Home + About)
    services/ clients/ portfolio/ management/ contact/   page-specific components
    typography/        RevealText, SectionLabel, YearMark
    ui/                SelectionBox, ServiceGlyph, FilterChips, Cursor
    navigation/ transitions/ layout/ buttons/ providers/ brand/
  three/               Anchor Field scene, shaders, nib contours, FormStage (lazy WebGL host)
  data/                all copy and content (single source of truth)
  lib/                 site config, motion tokens, device hooks, focus trap
scripts/optimize-images.mjs
```

All copy comes from `src/data/*` and `src/lib/site.ts` (sourced from the client's Word document). Components never hard-code content.

## Adding client assets

Originals go in `assets-src/` (git-ignored); `npm run images` writes optimised WebP to `public/` and prints each file's dimensions.

**Client logos** — `assets-src/clients/<category>/<client-slug>.svg|png`, run `npm run images`, then set `logo` on the entry in `src/data/clients.ts`:

```ts
{ ...,  logo: { src: "/clients/food/gauchos.webp", width: 800, height: 320, tone: "dark" } }
```

`tone: "dark"` logos are inverted on dark surfaces. Entries without a logo render as a typographic wordmark.

**Portfolio** — `assets-src/portfolio/<project-slug>/*.jpg`, run `npm run images`, then add an entry to `portfolio` in `src/data/portfolio.ts` (cover + media with the printed width/height, the brand as `title` and what the piece is as `detail`). The exhibition and filters switch on automatically; while the list is empty the page shows an honest "being installed" state.

## Contact & social

Email, phone numbers, address and social profile URLs live in `src/lib/site.ts` (`contact`). The Contact page and footer read from there, so updating a detail updates it everywhere.
