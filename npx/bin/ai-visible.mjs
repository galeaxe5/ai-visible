#!/usr/bin/env node
// ai-visible: checks what AI search crawlers that do not run JavaScript can read on a page.
// Read-only: one GET of the page, plus robots.txt, sitemap.xml and llms.txt of the site the page ends up on
// (redirects are followed and reported). No other requests. MIT licence. https://github.com/galeaxe5/ai-visible
import { parse } from "parse5";
const VERSION = "0.1.0";
const UA = `ai-visible/${VERSION} (+https://github.com/galeaxe5/ai-visible)`;
const SEARCH_BOTS = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];
const TRAINING_BOTS = ["GPTBot", "ClaudeBot"];
const MAX_BYTES = 5_000_000;
const MAX_ROBOTS_BYTES = 500 * 1024; // RFC 9309: crawlers must read at least 500 KiB
const MIN_WORDS = 50; // below this: a warning
const EMPTY_WORDS = 10; // below this: the page is treated as an empty shell

function usage(code = 0) {
  console.log(`Usage: npx ai-visible <url> [--expect "phrase"] [--json]

Checks what AI search crawlers that do not run JavaScript can read on the page:
  - main text in the <body> HTML before JavaScript (rough word count)
  - <title>, meta description, <h1>
  - robots.txt rules for AI search bots (${SEARCH_BOTS.join(", ")}) for this page
  - sitemap.xml and llms.txt

Options:
  --expect "phrase"  check that this phrase (for example, your headline) is in the body text
  --json             print the result as JSON
Exit code: 0 = no problems found, 1 = problems found, 2 = the check could not run.`);
  process.exit(code);
}

const args = process.argv.slice(2);
if (!args.length || args.includes("-h") || args.includes("--help")) usage(args.length ? 0 : 2);
if (args.includes("-v") || args.includes("--version")) { console.log(VERSION); process.exit(0); }
const json = args.includes("--json");
const ei = args.indexOf("--expect");
const expect = ei >= 0 ? (args[ei + 1] ?? "") : null;
const target = args.find((a, i) => !a.startsWith("--") && !(ei >= 0 && i === ei + 1));
if (!target) usage(2);
if (expect !== null && expect.startsWith("--")) { console.error("--expect needs a phrase, for example --expect \"Your headline\""); process.exit(2); }
if (expect !== null && !expect.trim()) { console.error("--expect needs a non-empty phrase"); process.exit(2); }

if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target) && !/^https?:\/\//i.test(target)) { console.error("Only http and https addresses are supported"); process.exit(2); }
let url;
try { url = new URL(/^https?:\/\//i.test(target) ? target : `https://${target}`); } catch { console.error(`Not a valid address: ${target}`); process.exit(2); }

async function get(u, accept, limit = MAX_BYTES) {
  const res = await fetch(u, { headers: { "user-agent": UA, accept }, redirect: "follow", signal: AbortSignal.timeout(20000) });
  if (!/^https?:$/.test(new URL(res.url).protocol)) throw new Error("redirected to a non-http address");
  const reader = res.body?.getReader();
  const chunks = []; let size = 0; let truncated = false;
  if (reader) for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (size + value.length > limit) { chunks.push(value.subarray(0, limit - size)); size = limit; truncated = true; await reader.cancel(); break; }
    size += value.length; chunks.push(value);
  }
  return { status: res.status, type: res.headers.get("content-type") || "", url: res.url, text: Buffer.concat(chunks).toString("utf8"), truncated };
}
const tryGet = async (u, a, l) => { try { return await get(u, a, l); } catch (e) { return { error: String(e?.message || e) }; } };

// HTML is parsed with parse5 (the WHATWG HTML parsing algorithm), so comments, raw-text elements,
// entities and broken markup are handled the way browsers handle them.
const HIDDEN = new Set(["script", "style", "noscript", "template", "svg", "head"]);
// Strip terminal control characters before printing anything that came from the network.
const safe = (x) => String(x).replace(/[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩]/g, " ");
const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
// Iterative tree walks (no recursion), so deeply nested pages cannot overflow the stack.
function* walk(root, skipHidden) {
  const stack = [root];
  while (stack.length) {
    const n = stack.pop();
    yield n;
    if (skipHidden && n !== root && n.tagName && HIDDEN.has(n.tagName)) continue;
    const kids = n.childNodes || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
}
const find = (root, tag) => { for (const n of walk(root, false)) if (n.tagName === tag) return n; return null; };
// Inline elements join their text with the neighbours ("Pas<span>portoo</span>" -> "Pasportoo");
// all other elements and <br> separate words.
const INLINE = new Set(["a", "abbr", "b", "bdi", "bdo", "cite", "code", "data", "dfn", "em", "i", "kbd", "mark", "q", "s", "samp", "small", "span", "strong", "sub", "sup", "time", "u", "var", "font", "label", "del", "ins"]);
function textIn(root) { // visible text, skipping hidden elements; template contents live outside childNodes
  const parts = []; const stack = [[root, false]];
  while (stack.length) {
    const [n, exiting] = stack.pop();
    if (n.nodeName === "#text") { parts.push(n.value); continue; }
    const sep = n.tagName && !INLINE.has(n.tagName);
    if (exiting) { if (sep) parts.push(" "); continue; }
    if (n !== root && n.tagName && HIDDEN.has(n.tagName)) { parts.push(" "); continue; }
    if (sep) parts.push(" ");
    stack.push([n, true]);
    const kids = n.childNodes || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push([kids[i], false]);
  }
  return parts.join("");
}
const clean = (t) => t.replace(/\s+/g, " ").trim();
function collect(root, tag) { const out = []; for (const n of walk(root, true)) if (n.tagName === tag && !(n !== root && HIDDEN.has(n.tagName))) out.push(n); return out; }
const attr = (el, name) => el.attrs?.find((a) => a.name === name)?.value ?? null;
const fail = (msg) => { console.error(safe(msg)); process.exit(2); };

// robots.txt per RFC 9309: merge all groups that name the bot (else "*"), longest matching rule wins, allow wins ties.
function parseRobots(txt) {
  const groups = []; let cur = null; let lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim(); if (!line) continue;
    const i = line.indexOf(":"); if (i < 0) continue;
    const key = line.slice(0, i).trim().toLowerCase(); const val = line.slice(i + 1).trim();
    if (key === "user-agent") { if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(val.toLowerCase()); lastWasAgent = true; }
    else if (key === "allow" || key === "disallow") { lastWasAgent = false; if (cur) cur.rules.push({ allow: key === "allow", path: normPath(val) }); }
    // other lines (Sitemap:, Crawl-delay: ...) do not end or split a group (RFC 9309)
  }
  return groups;
}
// Percent-encoding normalisation (RFC 9309 section 2.2.2): non-ASCII as UTF-8 %XX, hex upper-case,
// %XX of unreserved characters decoded, so "/caf%C3%A9", "/café" and "/caf%c3%a9" compare equal.
function normPath(p) {
  let out = "";
  for (let i = 0; i < p.length; i++) {
    const c = p[i];
    if (c === "%" && /^[0-9a-fA-F]{2}$/.test(p.slice(i + 1, i + 3))) {
      const code = parseInt(p.slice(i + 1, i + 3), 16); const ch = String.fromCharCode(code);
      out += /[A-Za-z0-9\-._~]/.test(ch) ? ch : "%" + p.slice(i + 1, i + 3).toUpperCase(); i += 2;
    } else if (c.charCodeAt(0) > 0x7e || c.charCodeAt(0) < 0x21) {
      const cp = p.codePointAt(i); const chr = String.fromCodePoint(cp); if (chr.length === 2) i++;
      out += [...Buffer.from(chr, "utf8")].map((b) => "%" + b.toString(16).toUpperCase().padStart(2, "0")).join("");
    } else out += c;
  }
  return out;
}
// Wildcard match without regular expressions: '*' = any sequence, trailing '$' = end of path.
// Greedy algorithm with one backtrack point: O(path * pattern) in the worst case, with a global step budget.
class TooComplex extends Error {}
let budget = 50_000_000; // matcher steps for the whole check; beyond this the check is reported as incomplete
function ruleMatches(pattern, path) {
  if (!pattern) return false;
  const anchored = pattern.endsWith("$"); const p = anchored ? pattern.slice(0, -1) : pattern;
  let pi = 0, si = 0, star = -1, mark = 0;
  while (si < path.length) {
    if (--budget < 0) throw new TooComplex();
    if (pi < p.length && p[pi] === "*") { star = pi++; mark = si; continue; }
    if (pi < p.length && p[pi] === path[si]) { pi++; si++; continue; }
    if (pi >= p.length && !anchored) return true; // prefix match is enough
    if (star >= 0) { pi = star + 1; si = ++mark; continue; }
    return false;
  }
  while (pi < p.length && p[pi] === "*") pi++;
  return pi === p.length;
}
function robotsAllows(groups, bot, path) {
  const token = bot.toLowerCase();
  let rules = groups.filter((g) => g.agents.includes(token)).flatMap((g) => g.rules);
  if (!groups.some((g) => g.agents.includes(token))) rules = groups.filter((g) => g.agents.includes("*")).flatMap((g) => g.rules);
  let best = null;
  for (const r of rules) {
    if (!ruleMatches(r.path, path)) continue;
    const len = r.path.replace(/\$$/, "").length;
    if (!best || len > best.len || (len === best.len && r.allow)) best = { len, allow: r.allow };
  }
  return best ? best.allow : true;
}

const page = await tryGet(url.href, "text/html");
if (page.error) fail(`Could not load ${url.href} (${page.error})`);
if (page.status >= 400) fail(`The page returned HTTP ${page.status}`);
if (!/text\/html|application\/xhtml/i.test(page.type)) fail(`The page is not HTML (${page.type || "no content type"})`);

if (page.truncated) fail(`The page is larger than ${MAX_BYTES / 1e6} MB, so the check would be incomplete. Not checked.`);
const doc = parse(page.text);
const bodyEl = find(doc, "body");
const body = clean(bodyEl ? textIn(bodyEl) : "");
const words = body ? body.split(" ").length : 0;
const headEl = find(doc, "head");
const titleEl = headEl ? find(headEl, "title") : null;
const title = clean(titleEl ? titleEl.childNodes.map((c) => c.value || "").join("") : "");
const metas = headEl ? [...walk(headEl, false)].filter((n) => n.tagName === "meta") : [];
const descEl = metas.find((m) => (attr(m, "name") || "").toLowerCase() === "description");
const desc = clean(descEl ? attr(descEl, "content") || "" : "");
const h1s = bodyEl ? collect(bodyEl, "h1").map((h) => clean(textIn(h))).filter(Boolean).slice(0, 20) : [];

const final = new URL(page.url);
const origin = final.origin;
const path = normPath((final.pathname || "/") + final.search);
const [robotsRes, sitemapRes, llmsRes] = await Promise.all([tryGet(`${origin}/robots.txt`, "text/plain", MAX_ROBOTS_BYTES), tryGet(`${origin}/sitemap.xml`, "application/xml", 1_000_000), tryGet(`${origin}/llms.txt`, "text/plain", 1_000_000)]);

let robotsState; let groups = [];
if (robotsRes.error || robotsRes.status >= 500) robotsState = "unreachable";
else if (robotsRes.status >= 400) robotsState = "missing";
else if (robotsRes.status === 200 && !/<html/i.test(robotsRes.text)) { robotsState = "found"; groups = parseRobots(robotsRes.text); }
else robotsState = "missing";
let blockedSearch = [], blockedTraining = [];
try {
  if (robotsState === "found") {
    blockedSearch = SEARCH_BOTS.filter((b) => !robotsAllows(groups, b, path));
    blockedTraining = TRAINING_BOTS.filter((b) => !robotsAllows(groups, b, path));
  }
} catch (e) { if (e instanceof TooComplex) fail("robots.txt rules are too complex to check completely for this address. Not checked."); throw e; }
const robotsSitemap = robotsState === "found" && /^\s*sitemap\s*:/im.test(robotsRes.text);
const hasSitemap = (!sitemapRes.error && sitemapRes.status === 200 && /<(urlset|sitemapindex)\b/i.test(sitemapRes.text)) || robotsSitemap;
const hasLlms = !llmsRes.error && llmsRes.status === 200 && !/<html/i.test(llmsRes.text) && llmsRes.text.trim().length > 20;
const expectFound = expect === null ? null : norm(body).includes(norm(expect));

const problems = [], notes = [];
const fewWords = words < MIN_WORDS;
const emptyShell = words < EMPTY_WORDS && expectFound !== true && h1s.length === 0;
if (emptyShell) problems.push(`Only about ${words} words of text in the HTML before JavaScript. AI crawlers that do not run JavaScript probably see an almost empty page.`);
else if (fewWords) notes.push(`Only about ${words} words of text in the HTML before JavaScript. Fine if the page is short on purpose; otherwise AI crawlers see very little.`);
if (expectFound === false) problems.push(`The phrase "${expect}" is not in the body text before JavaScript.`);
if (!title) problems.push("No <title>.");
if (!desc) problems.push("No meta description.");
if (!h1s.length) problems.push("No <h1> in the HTML before JavaScript.");
if (blockedSearch.length) problems.push(`robots.txt blocks AI search bots for this page: ${blockedSearch.join(", ")}. If that is not on purpose, AI search cannot use it.`);
if (robotsState === "unreachable") problems.push(`robots.txt could not be loaded (${robotsRes.error ? "network error" : "HTTP " + robotsRes.status}). Under the robots.txt standard, crawlers may then treat the whole site as blocked.`);
if (blockedTraining.length) notes.push(`robots.txt blocks training crawlers for this page: ${blockedTraining.join(", ")}. That is the owner's choice and does not block AI search.`);
if (robotsState === "found" && robotsRes.truncated) notes.push("robots.txt is larger than 500 KiB; only the first 500 KiB were read, as the robots.txt standard allows.");
if (final.href !== url.href) notes.push(`Redirected to ${final.href}; robots.txt, sitemap.xml and llms.txt were read from ${origin}.`);
if (!hasSitemap) notes.push("No sitemap.xml found (at /sitemap.xml or in robots.txt).");
if (!hasLlms) notes.push("No /llms.txt (optional; not every AI tool reads it).");
if (h1s.length > 1) notes.push(`${h1s.length} <h1> headings; one is clearer.`);

const result = { url: page.url, status: page.status, wordsBeforeJs: words, title, description: desc, h1: h1s, expectFound, robots: { state: robotsState, blockedSearchBots: blockedSearch, blockedTrainingBots: blockedTraining }, sitemap: hasSitemap, llmsTxt: hasLlms, truncated: page.truncated, problems, notes };
if (json) { console.log(JSON.stringify(result, null, 2)); process.exit(problems.length ? 1 : 0); }

const mark = (b) => (b ? "OK  " : "FAIL");
console.log(`\nai-visible ${VERSION}: ${safe(page.url)}\n`);
console.log(`${emptyShell ? "FAIL" : fewWords ? "WARN" : "OK  "} Text in the HTML before JavaScript: about ${words} words`);
if (expectFound !== null) console.log(`${mark(expectFound)} Phrase "${safe(expect)}" ${expectFound ? "found" : "not found"} in the body text`);
console.log(`${mark(!!title)} Title: ${safe(title) || "(missing)"}`);
console.log(`${mark(!!desc)} Description: ${safe(desc) || "(missing)"}`);
console.log(`${mark(h1s.length > 0)} H1: ${safe(h1s[0] || "") || "(missing)"}`);
const robotsLine = robotsState === "unreachable" ? "robots.txt could not be loaded" : robotsState === "missing" ? "AI search bots allowed (no robots.txt)" : "AI search bots allowed by robots.txt for this page";
console.log(`${mark(!blockedSearch.length && robotsState !== "unreachable")} ${robotsLine}`);
for (const n of notes) console.log(`note ${safe(n)}`);
if (problems.length) { console.log("\nProblems:"); for (const p of problems) console.log(`- ${safe(p)}`); }
console.log(`\nLimits: a simple HTML text filter, not a browser (CSS is not applied). It does not prove a real AI crawler is let in: a firewall or CDN can still block it.`);
console.log(`Fix prompts for AI assistants: https://github.com/galeaxe5/ai-visible/tree/main/prompts`);
console.log(`Free basic check, including keys exposed in the site's scripts: https://mcp.pasportoo.com/check?url=${encodeURIComponent(final.host)}&utm_source=npx\n`);
process.exit(problems.length ? 1 : 0);
