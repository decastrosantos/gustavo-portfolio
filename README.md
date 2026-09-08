# Gustavo de Castro — Portfolio

> **Data. Intelligence. Creativity.**
> A premium, scroll-driven personal portfolio for a Data Analyst / Data Scientist / AI Enthusiast, built as an editorial, interactive story rather than a conventional "About / Skills / Projects / Contact" template.

**Live site:** [gustavo-de-castro.vercel.app](https://gustavo-de-castro.vercel.app)
**Hero case study:** [The Legend of SQL — Nullbane: The Query Keepers](https://www.thelegendofsql.com/)

---

## What this is

This repository contains the full source of Gustavo de Castro's personal portfolio: a single-page, vanilla JavaScript + Vite site designed around scroll-based storytelling, canvas-driven data visuals, and a narrative arc that goes:

```
Arrival → Seeing → Path → Craft → Work → Datania (hero case study)
        → Surfaces (BI / AI) → Years → Study → Graph → Signal (contact)
```

Rather than a grid of project cards and a bullet list of technologies, the site treats the visitor's scroll position as a timeline: typography reveals, a canvas-rendered "data field" reacts to scroll and cursor position, and the hero project — **Nullbane: The Query Keepers** — gets a full cinematic transition into its own visual world before returning to the portfolio's own language.

## Highlights

- **Fully custom scroll storytelling** — sticky sections, scroll-linked reveals, a progress rail, and a live section indicator ("00 — Arrival", "05 — Datania", …), all in plain CSS/JS, no animation framework.
- **Canvas data backgrounds** — a hand-built `<canvas>` layer renders a subtle Medallion Architecture diagram (**Bronze → Silver → Gold**), a data-point field, SQL/ML tokens (`SELECT`, `FEATURE`, `RAG`, `AGENT`…), a table schema sketch, and a stacked-layers motif — a background that reads as "data analytics, engineering, science and AI" instead of generic particles.
- **Interactive technology graph** — a cursor-reactive canvas constellation of the core stack orbiting a central `DATA` node.
- **Hero case study: The Legend of SQL** — a dedicated, cinematically composed section for [Nullbane: The Query Keepers](https://www.thelegendofsql.com/), an RPG built to practice real SQL against a live PostgreSQL/Supabase database, with its own visual identity (Cinzel-adjacent serif, gold/teal palette) layered on top of the site's own design language.
- **Trilingual (EN / ES / PT)** — every string is translated and swapped client-side via a small i18n module (`src/i18n.js`); the visitor's choice is remembered in `localStorage`. The site currently defaults to **Spanish** on first visit.
- **Light / Dark theme** — a full CSS custom-property theme swap (not just an inverted filter), persisted in `localStorage`, defaulting to the visitor's OS preference on first visit.
- **Direct access to live Power BI reports** — six published dashboards (Project Management, Logistics, Human Resources, Sales, Formula 1, Netflix) linked directly, no intermediate landing page.
- **Accessibility-conscious** — skip link, `prefers-reduced-motion` support (canvases and CSS animations are disabled/simplified), semantic landmarks, `aria-live` regions for the dynamic skills panel, and keyboard-operable navigation.
- **No build-heavy dependencies** — the entire interactive experience (loader, scroll tracking, canvases, i18n, theme) is under a few hundred lines of dependency-free JavaScript, bundled by Vite.

## Tech stack

| Layer | Choice |
|---|---|
| Build tool | [Vite](https://vitejs.dev/) (vanilla JS template, no framework) |
| Markup | Semantic HTML5 (`index.html`) |
| Styling | Plain CSS with custom properties for theming (`src/styles.css`) |
| Interactivity | Vanilla JavaScript, ES modules (`src/main.js`) |
| i18n | Custom dictionary-based translator (`src/i18n.js`) |
| Visuals | Canvas 2D (data field + technology graph), generated imagery for case-study art |
| Hosting | [Vercel](https://vercel.com/) |
| Fonts | Instrument Serif, Outfit, IBM Plex Mono (Google Fonts) |

No React, no animation library, no CSS framework — everything is hand-built to keep the bundle small and the motion intentional.

## Project structure

```
Portfolio/
├── index.html            # Single-page markup, all sections, i18n data attributes
├── vercel.json            # Vercel build config (framework: vite, outputDirectory: dist)
├── vite.config.js         # Vite dev server config
├── package.json
├── public/
│   ├── favicon.svg
│   └── media/             # Generated case-study / section artwork (jpg)
│       ├── ai-lattice.jpg
│       ├── bi-constellation.jpg
│       ├── data-field.jpg
│       └── datania-keep.jpg
└── src/
    ├── main.js            # Loader, scroll tracking, canvases, i18n/theme wiring
    ├── i18n.js             # EN / ES / PT dictionaries + lang/theme detection
    └── styles.css          # Full design system (tokens, layout, motion, themes)
```

## Getting started

### Prerequisites
- Node.js 18+ and npm

### Install & run locally

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` (configured with `strictPort: true` in `vite.config.js`).

### Build for production

```bash
npm run build   # outputs to ./dist
npm run preview # serve the production build locally
```

## Deployment

The site is deployed on **Vercel** as a static Vite build.

```bash
npx vercel login      # one-time device login
npx vercel --yes --prod
```

`vercel.json` pins the framework and build settings explicitly:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

> Note: Vercel project names must be lowercase and cannot contain the sequence `---`; the production project here is `gustavo-de-castro`.

## Content & data notes

- **The Legend of SQL / Nullbane: The Query Keepers** — all copy about the game (world of Datania, antagonist Null, 100 levels, 3 languages, verifiable certificates, Supabase + PostgreSQL with row-level security) is sourced from the project's own site and public posts; no gameplay detail is invented.
- **Power BI reports** — the six linked dashboards open the live, published Power BI report URLs directly; no embedding, no intermediary "old portfolio" page.
- **Career & education timelines** — reflect the author's real professional history and academic background (Journalism, Digital Marketing, Data Analytics, Data Science/AI & Big Data Analytics).

## Customization guide

- **Copy / translations** — edit `src/i18n.js`. Every visible string lives under `I18N.en`, `I18N.es`, `I18N.pt`; the HTML only holds `data-i18n="path.to.key"` attributes, so adding a language means adding one more top-level object with the same key shape.
- **Default language** — `detectLang()` in `src/i18n.js` (and the inline bootstrap script in `index.html`) currently defaults to `"es"` when nothing is saved in `localStorage`.
- **Theme tokens** — all colors are CSS custom properties defined on `:root` and overridden under `html[data-theme="light"]` in `src/styles.css`.
- **Data background motifs** — the canvas drawing routines (`drawGrid`, `drawMedal`, `drawPipeline`-style helpers, `drawSchema`, `drawLayers`, `drawTokens`) live in `fieldCanvas()` inside `src/main.js`.
- **Reports list** — the six Power BI links live in the `#reports` list in `index.html`; swap the `href` and the `data-i18n="bi.rN"` label/translation to add or change a dashboard.

## License

This is a personal portfolio. Feel free to explore the code for inspiration, but the content, copy, and imagery are personal to Gustavo de Castro and not licensed for reuse as-is.

## Contact

- **LinkedIn:** [linkedin.com/in/gustavo-de-castro-1910](https://www.linkedin.com/in/gustavo-de-castro-1910)
- **The Legend of SQL:** [thelegendofsql.com](https://www.thelegendofsql.com/)
