# ai-visible: a rule for AI coding assistants

Makes the sites your AI assistant builds readable by ChatGPT, Claude and Perplexity, and keeps secret keys out of the front end.

| Tool | Install |
|---|---|
| Cursor | Copy `rules/ai-visible.mdc` to `.cursor/rules/ai-visible.mdc` in your project |
| Claude Code | Copy the `skills/ai-visible` folder to `.claude/skills/` (this project) or `~/.claude/skills/` (all projects) |
| Codex, other tools that read AGENTS.md | Paste `AGENTS-snippet.md` into `AGENTS.md` in the project root |

## Fix prompts

Copy-paste prompts for ChatGPT, Claude, Cursor or another AI assistant, by stack (React + Vite, Vue + Vite, Next.js, SvelteKit, any stack) and one for secret keys in the front end: [prompts/](prompts/README.md).

Free basic check: https://mcp.pasportoo.com/check

The numbers in the rule come from our own scan, see METHOD.md.
