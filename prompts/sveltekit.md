# SvelteKit: pages with server rendering turned off

```text
My site uses SvelteKit. Find public pages (home, pricing, blog, docs) where server rendering is turned off (export const ssr = false in a +layout or +page file), or where the main text is loaded only in the browser (in onMount).
For those pages:
- turn server rendering back on;
- use export const prerender = true where the content is static;
- load data in a load function in +page.server.js or +page.js, not in onMount.
Keep ssr = false only for logged-in app routes that need it.
Add <svelte:head> with a title and description per public page, and a sitemap.
Show me the plan first and wait for my OK.
Finally, run the quick diagnostic from https://github.com/galeaxe5/ai-visible (section 5 of the rule) on the deployed page, with EXPECT set to the main headline. Tell me exactly what it printed. Do not guess the result.
```
