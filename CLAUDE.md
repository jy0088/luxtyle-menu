# luxtyle-menu

Digital menu PWA for Luxtyle Creations' restaurant brands (YGF Malatang, Bei Yuan Tea & Boba, Tomo Gelato).
Deployed to `luxtyle.biz` via Vercel on every push to `main`.

## Talk to Kevin in Mandarin Chinese
Code, commit messages, and code comments stay in English. All user-facing copy must be bilingual (中文 + English) — no exceptions.

## Start of every session on YGF work
Read these before touching code, and trust `git log` over any summary:
- `docs/ygf/ygf-next-tasks.md` — current task list
- `docs/ygf/ygf-handoff.md` — architecture of the YGF page, decisions, content red lines
- `docs/ygf/ygf-explore-naming.md` — locked menu naming (levels 1–3)

## Stack
- Next.js 16 App Router + Turbopack + TypeScript
- `next-pwa` is decoupled from the main config (incompatible with Next 16 Turbopack) — don't re-add it
- YGF Explore page: `src/app/menu/ygf/page.tsx`, content data: `src/app/menu/ygf/picksData.ts`, menu data: `menuData`

## Environment
- Windows + PowerShell, repo at `E:\Projects\luxtyle-menu`
- Commit messages must be single-line (multi-line strings break PowerShell with `>>` continuation)
- Paths containing `[id]` need `-LiteralPath`
- Python reading files with BOM: use `utf-8-sig`

## Before pushing
- Run `npm run build` and make sure it passes — a push to `main` deploys to production immediately
- Show Kevin the diff summary and get a go-ahead before `git push`

## Content red lines
- Never invent product facts (ingredients, cooking times, ratios, allergens). If a fact isn't in `menuData`, POS screenshots, or text Kevin supplied, leave it out or mark it `[草稿]`.
- Anything marked `[草稿]` must not ship as fact. `SAUCE_RECIPES` ratios are fabricated placeholders and must be replaced before launch.
- Empty content hides its section — never render an empty heading.

## Locked decisions — don't reopen
- The four level-1 names on the YGF page are final.
- The YGF page is an in-store "explore page" for seated guests, not an ordering app. Goals: drive traffic, browsability, convert guests into the WhatsApp channel (Ma-Fans).
- The WhatsApp channel is anonymous — no member list, no API. Perks are redeemed at the counter only; don't build server-side membership verification against it.
