# Vue + Vite: make the public pages readable by AI

```text
My site is a Vue app built with Vite. It renders in the browser, so AI search crawlers that don't run JavaScript see an almost empty page.

Prerender the public pages (home, pricing, blog, docs) at build time with vite-ssg, which is maintained. If the project is already Nuxt, use Nuxt's server rendering or prerendering instead.
- Logged-in pages stay client-side. Don't break them.
- Code that touches window, document or localStorage must not run during the build.
- Text and data a public page needs must be in the HTML, not loaded after mount.
- Add a unique <title>, a meta description, one <h1> and Open Graph tags per public page (for example with @unhead/vue), and add sitemap.xml.
Show me the plan first and wait for my OK.
Finally, run the quick diagnostic from https://github.com/galeaxe5/ai-visible (section 5 of the rule) on the deployed page, with EXPECT set to the main headline. Tell me exactly what it printed. Do not guess the result.
```
