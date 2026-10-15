# mahrs-portfolio

Personal portfolio for Mahrs Aslam. Plain HTML, CSS, and a little vanilla JS. No build step, no framework, no tracking. Deployed on GitHub Pages.

## Structure

```
index.html              Home: hero board, five featured projects, more work, how I work, toolbelt, writing, contact
about.html              Background, human-factors note, timeline, toolbox
404.html                Not-found page (GitHub Pages serves it automatically)
remnant.html            Earlier work: Remnant Labs
amplify.html            Earlier work: ProgramEquity / Amplify
work/design-system.html Flagship: the design-system story with the pipeline docs embedded
work/*.html             Case studies and deep dives
writing/*.html          Posts + index
css/style.css           Tokens (light/dark, five brand hues), primitives, components, wireframe + mid-fi mock system
js/main.js              Theme toggle, nav state, reveal, copy email, reading time, on-page TOC
js/geohash.js           Interactive geohash explorer (geospatial case study)
assets/                 Favicon, OG image (+ the HTML it was rendered from)
images/                 Legacy project images, university project screenshots, resume PDF
images/covers/          Home-page thumbnails rendered from the site's own CSS mockups (headless Chrome)
```

## Conventions

- **No real product UI.** Company products are drawn as anonymised mockups with the `.wire` system in `style.css` (`.w-row`, `.w-col`, `.w-bar`, `.w-txt`, `.w-chip`, `.w-card`, `.w-map`…). Real layout, redacted data, no branding. University and personal projects may use real screenshots.
- **Hues.** Every card, page, and callout takes one of `.hue-coral/.hue-mustard/.hue-teal/.hue-violet/.hue-pink`; accents (`.a`, `.a-soft`, `.tldr`, `.steps`, `.stack`) follow it via `--c` / `--c-soft`.
- **Case page anatomy.** `case-hero` (eyebrow, h1, lead, `case-meta`, `tldr`) → `case-cover` + `confidential` caption + `stack` "Built with" callout → `case-body > .prose` (JS adds the TOC) → `case-nav`. Each case carries one `.psych` note with a real citation.
- **Relative paths only** so the site works as a GitHub Pages project page under any account or repo name.
- **Theme:** tokens on `:root`, dark overrides under `[data-theme="dark"]` and `prefers-color-scheme`; a small inline script in each `<head>` applies the stored theme before first paint.
- `CSDocsUofA/` holds private source documents and is git-ignored. Don't commit it.

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Push to a GitHub repo and enable Pages from the branch root. `.nojekyll` keeps Pages from processing the folders. Update `sitemap.xml` and the OG image (`assets/og.html` → screenshot → `assets/og.png`) when pages change.
