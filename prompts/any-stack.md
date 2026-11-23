# Any stack: find out why AI can't read my site, then fix it

Paste this into ChatGPT, Claude, Cursor or another AI assistant that can see your project files.

```text
My website may look empty to AI search crawlers (ChatGPT, Claude, Perplexity), because many of them read only the HTML the server sends and do not run JavaScript.

1. Look at my project and tell me:
   - which framework and build tool it uses;
   - which pages are public (home, pricing, blog, docs) and which are the logged-in app;
   - whether the public pages have their main text in the server HTML, or render it only in the browser.
2. Propose the smallest change that puts the main text of the public pages into the HTML: server rendering or prerendering at build time. Only suggest maintained tools, and check when each package was last released before you suggest it. Do not change the logged-in app.
3. Make sure every public page has a unique <title>, a meta description, one <h1> and Open Graph tags.
4. Check robots.txt and tell me whether it blocks the AI search crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot). If a block looks intentional, keep it and ask me. List any robots.txt change you propose in the plan. Rules for GPTBot and ClaudeBot (the training crawlers) change only if I decide so separately.
5. Check that no secret keys (OpenAI, Anthropic, Stripe sk_live_, Supabase service_role) are in front-end code or in VITE_*, NEXT_PUBLIC_* or REACT_APP_* variables.
Explain the plan in plain words and wait for my OK before you change files.
Finally, run the quick diagnostic from https://github.com/galeaxe5/ai-visible (section 5 of the rule) on the deployed page, with EXPECT set to the main headline. Tell me exactly what it printed. Do not guess the result.
```
