# ai-visible

Check if AI search (ChatGPT, Claude, Perplexity) can read your site:

```bash
npx ai-visible your-site.com
```

It shows:
- how much text is in the HTML before JavaScript runs (many AI crawlers do not run JavaScript): under 10 words with no `<h1>` is reported as an empty page, under 50 words as a warning;
- title, meta description and `<h1>`;
- whether `robots.txt` blocks the AI search bots (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`);
- whether there is a `sitemap.xml` and an `/llms.txt`.

Options:
- `--expect "Your headline"`: check that this phrase is in the body text. If it is found, a short page is not reported as a problem.
- `--json`: machine-readable output.

Exit codes: `0` no problems found, `1` problems found, `2` the check could not run.

What it does:
- It reads the page, and the robots.txt, sitemap.xml and llms.txt of the site the page ends up on, like a visitor would.
- It follows redirects and tells you when it was redirected. It sends nothing anywhere else.
- robots.txt is read the way the robots.txt standard (RFC 9309) describes: the rules for the exact page are checked, and if robots.txt cannot be loaded because of a server error, crawlers may treat the whole site as blocked.

Limits: it is a simple text filter, not a browser (CSS is not applied). It does not prove that a real AI crawler is let in: a firewall or CDN can still block one. Pages larger than 5 MB are not checked (exit code 2), so a partial result is never reported as complete.

Fix prompts and a rule for Cursor / Claude Code: https://github.com/galeaxe5/ai-visible

Needs Node.js 20.19 or newer. One dependency: parse5 (the standard HTML parser), so pages are read the way browsers read them.

MIT licence.
