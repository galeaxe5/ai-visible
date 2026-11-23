# Method of the 2026-11-23 scan

- **Sites:** Show HN posts from the 7 days before 2026-11-23, taken from the public HN Algolia API. Links to GitHub, YouTube, GitLab, arXiv, app stores and Hugging Face were excluded. That left 622 URLs; 595 answered with HTML.
- **Request:** one GET of the home page, following redirects, 12-second timeout. No JavaScript was run.
- **Words:** `<script>`, `<style>` and `<noscript>` blocks and all tags were removed, then words were counted.
- **SPA markers:** a module script from `/assets/index-*.js` (Vite) or an element with `id="root"` or `id="app"`, with no stronger framework marker (Next.js, Nuxt, SvelteKit, Astro, WordPress and so on) found first. 108 pages matched; on 54 of them fewer than 50 words were extracted.

Limits:
- The markers are heuristics. They do not prove which framework a site uses or how it renders.
- Only home pages were checked, once each.
- Show HN authors are mostly developers, not a random sample of websites.
- Only totals are published, no site names.
