# Next.js: content that appears only after the page loads

Next.js prerenders HTML by default. In our scan most Next.js pages were readable, but some were not. The usual cause is content fetched in the browser, or a page wrapped in a loading screen.

```text
My site uses Next.js. Find public pages (home, pricing, blog, docs) whose main text is NOT in the server HTML. Typical causes:
- data fetched in useEffect or with a client-side fetching library;
- the whole page shown behind a spinner or skeleton until data loads;
- dynamic imports with ssr: false for main content;
- a client-only auth or theme wrapper around the whole layout that renders nothing on the server.

First tell me which router the project uses (App Router: app/ folder; Pages Router: pages/ folder). Do not migrate between them.
- App Router: load the data in a Server Component, so the HTML contains the text. generateStaticParams only lists dynamic routes to prebuild; it does not load data by itself. Use generateMetadata or a metadata export for the title and description of each public page.
- Pages Router: use getStaticProps (or getServerSideProps if the data must be fresh on every request), and set the title and description with next/head.
Keep "use client" for interactive parts. It does not by itself stop server HTML.
If there is no sitemap, propose one in the way that fits the router and the project, and ask me before adding it.
Show me the plan first and wait for my OK.
Finally, run the quick diagnostic from https://github.com/galeaxe5/ai-visible (section 5 of the rule) on the deployed page, with EXPECT set to the main headline. Tell me exactly what it printed. Do not guess the result.
```
