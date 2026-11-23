# React + Vite: make the public pages readable by AI

In our scan of one week of Show HN launches, 54 of 108 pages with heuristic single-page-app markers had fewer than 50 words in their HTML before JavaScript (see [../METHOD.md](../METHOD.md)).

```text
My site is a React app built with Vite. It renders everything in the browser, so AI search crawlers that don't run JavaScript see an almost empty page.

Make the public pages (home, pricing, blog, docs, and any marketing pages) prerendered at build time, so their HTML contains the real text.

First check package.json and pick the approach that fits the installed versions:
- React Router v7 or newer (react-router or react-router-dom 7+): use React Router's built-in prerendering. That means framework mode with ssr: false and a prerender list of the public routes. Follow the docs for the installed version.
- React Router v6, or no router: use vite-react-ssg. It is maintained, but check its peer dependencies against the project first.
- Do not downgrade packages to make a tool fit, and do not do major upgrades I didn't ask for.
- Do not use react-snap or vite-plugin-prerender: they have not been updated for years.

While doing it:
- Pages that need a logged-in user stay client-side. Don't break them.
- Code that touches window, document or localStorage must not run during the build. Guard it or move it into effects or client loaders.
- Data a public page needs (prices, feature lists) must be available at build time, not set in useEffect.
- If the build output folder changes (for example dist/ becomes build/client/), tell me, because the hosting settings must change too.
- Make sure pages that are not prerendered still load on the host. Set up the single-page-app fallback the host needs.
- Use my real domain for the canonical link, og:url and the sitemap. Ask me for it if you don't know it.

Also add a unique <title>, a meta description, one <h1> and Open Graph tags to every public page, and add sitemap.xml.
Show me the plan first and wait for my OK.
Finally, run the quick diagnostic from https://github.com/galeaxe5/ai-visible (section 5 of the rule) on the deployed page, with EXPECT set to the main headline. Tell me exactly what it printed. Do not guess the result.
```
