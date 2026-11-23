# ai-visible: a rule for AI coding assistants

Makes the sites your AI assistant builds readable by ChatGPT, Claude and Perplexity, and keeps secret keys out of the front end.

| Tool | Install |
|---|---|
| Cursor | Copy `rules/ai-visible.mdc` to `.cursor/rules/ai-visible.mdc` in your project |
| Claude Code | Copy the `skills/ai-visible` folder to `.claude/skills/` (this project) or `~/.claude/skills/` (all projects) |
| Codex, other tools that read AGENTS.md | Paste `AGENTS-snippet.md` into `AGENTS.md` in the project root |

## Check a site from the terminal

```bash
npx ai-visible https://your-site.com
npx ai-visible https://your-site.com --expect "a phrase from your page"
```

Shows whether the text, title and description are in the HTML before JavaScript runs, and whether robots.txt lets AI search bots in. Needs Node.js 20.19 or newer. Source: [npx/](npx/), package: https://www.npmjs.com/package/ai-visible

## Fix prompts

Copy-paste prompts for ChatGPT, Claude, Cursor or another AI assistant, by stack (React + Vite, Vue + Vite, Next.js, SvelteKit, any stack) and one for secret keys in the front end: [prompts/](prompts/README.md).

Free basic check: https://mcp.pasportoo.com/check

The numbers in the rule come from our own scan, see METHOD.md.
