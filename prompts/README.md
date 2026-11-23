# Fix prompts

Copy-paste prompts for ChatGPT, Claude, Cursor or any AI coding assistant. Each one asks the assistant to:
1. look at your project first;
2. show you a plan and wait for your OK;
3. make the fix;
4. measure the result and report it (it must not guess).

| Your site | Prompt |
|---|---|
| Not sure what it's built with | [any-stack.md](any-stack.md) |
| React + Vite | [react-vite.md](react-vite.md) |
| Vue + Vite | [vue-vite.md](vue-vite.md) |
| Next.js | [nextjs.md](nextjs.md) |
| SvelteKit | [sveltekit.md](sveltekit.md) |
| Any: keys in the front end | [secret-keys.md](secret-keys.md) |

Notes:
- Packages: vite-react-ssg and vite-ssg are suggested because they were updated in 2026. react-snap (last release 2018) and vite-plugin-prerender (2022) are not. vite-react-ssg supports only React Router v6. For React Router v7+, the React prompt uses React Router's built-in prerendering.
- Tested: the React + Vite prompt was run once by an AI assistant on a test app (Vite 8, React 19, React Router 7, Nov 2026). The headline, prices, title and description ended up in the HTML; the logged-in page stayed client-side; the build passed with 0 npm audit findings. That test also showed vite-react-ssg does not fit React Router v7, so the prompt was changed. The other prompts have not been run on a real project yet. Tell us if one goes wrong: https://github.com/galeaxe5/ai-visible/issues
- Results: a readable page makes sure AI search has something to read. It does not guarantee that an assistant will recommend the site.
