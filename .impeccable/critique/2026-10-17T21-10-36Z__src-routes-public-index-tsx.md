---
target: check ui uix slopnya
total_score: 25
max_score: 36
na_heuristics: 7
p0_count: 1
p1_count: 2
target_identity: "file:/home/vibing/Public/mini-project/freaking-out/fe/src/routes/public/index.tsx"
target_fingerprint: "sha256:69bdadd96b7f680868fcbbeef7748de308b57b0deb931c0e91ae6a7ba9f46809"
target_path: /home/vibing/Public/mini-project/freaking-out/fe/src/routes/public/index.tsx
timestamp: 2026-10-17T21-10-36Z
slug: src-routes-public-index-tsx
---
# Critique — Public landing `/` + navbar/footer (`src/routes/public/index.tsx`)

## Design Health Score (Nielsen)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active nav + stats clear; no scroll-progress cue across 10 stacked sections |
| 2 | Match System / Real World | 3 | Strong local Indonesian copy, but `"5 + 2"` and enum leak `"ASSIGNED/SHARED"` (`fasilitas.ts:139`) |
| 3 | User Control & Freedom | 2 | Wilayah tabs aren't routable (refresh resets to Anambas); no back-to-top |
| 4 | Consistency & Standards | 3 | Tight system, but 4 different labels for the same `/register` action |
| 5 | Error Prevention | 3 | No forms here, yet requirements (KTP/KK, KTM) surface only in the far-down step section |
| 6 | Recognition vs Recall | 3 | Good nav, but duplicated/mismatched stats force reconciliation |
| 7 | Flexibility & Efficiency | n/a | No meaningful efficiency affordance for a persuasive landing page |
| 8 | Aesthetic & Minimalist | 3 | 7 patterns + big watermarks + stickers per section tip toward noise |
| 9 | Recognize/Diagnose/Recover | 2 | No explanation of what happens after "Daftar"; no fallback if register is down |
| 10 | Help & Documentation | 3 | Genuine "Cara jadi penghuni" + contact block |
| **Total** | | **25/36** | **Acceptable (69%, just under Good)** |

## Design Specificity Verdict — product-specific content on a category-generic skeleton

**LLM:** The *content* is real and un-swappable — headline names origin+destination (`hero.tsx:26`), `kepulauan.ts` carries sourced BPS stats, events are culturally authentic (Yasinan, Hari Jadi Kepri), and `IslandMark` is bespoke. But the *structure* is the canonical AI landing template (Hero→Marquee→Stats→Bento→Benefits→Events→Testimonials→4-step→2-card→CTA) with every section on the same `max-w-6xl py-16` + label + uppercase h2 + grid rhythm. Slop tells: live placeholder testimonials (`asrama.ts:193,202,210` → `testimoni.tsx:45`), seven decorative patterns rotated one-per-section with semantic ties only sometimes real (stripes/rings/dots = filler), duplicated IslandMark hero card in CTA (`hero.tsx:61-71` ~ `cta.tsx:68-77`), duplicated stats, and zero real imagery — every image slot is the abstract mark.

**Deterministic scan:** `impeccable detect` on the landing set -> exit 0, 0 findings. Confirmed functional (sanity run on `src/components` returned 11 findings in `src/components/ui/*`). Landing is genuinely clean under the rule set; the two rules the detector emits here (`border-accent-on-rounded`, `side-tab`) are neobrutalism's own vocabulary and would be benign misfires if they fired.

**Visual overlays:** No browser automation available this session; no overlay injected. Fallback = static evidence only (no computed styles/live contrast measured).

## Overall Impression
Thoughtful student-dorm site propped up by a generic landing skeleton. The craft (tokens, hard-shadow system, a11y toggles, reduced-motion) is real and the content authentic — but the two things a nervous parent needs are missing: proof the place exists (photos) and placeholder-free trust (testimonials). Biggest opportunity: replace abstract imagery and fake names with real faces, rooms, and a fee number.

## What's Working
- Authentic, verifiable content — sourced BPS stats (`wilayah.tsx:134`) and culturally specific programming could not be swapped onto another dorm.
- Coherent tokenized system — palette/shadow/radius declared once (`index.css:6-77`), hard-shadow behavior consistent from the Button primitive, `prefers-reduced-motion` correctly disables marquee + snap-in.
- Accessible brand mark — `IslandMark` flips `role/aria-label` vs `aria-hidden` via `decorative` (`island-mark.tsx:13-16`), used correctly everywhere.

## Priority Issues
- [P0] Live placeholder testimonials — `"Nama Penghuni"`/`"Nama Alumni"` with initials "N" render as real quotes (`asrama.ts:193-210`). Social proof on a trust purchase; fake names read as fabricated. Fix: real names/angkatan or explicitly reframe as an aggregate; delete the fake-name pattern. -> $impeccable clarify
- [P1] No real imagery of place or people — every slot is `IslandMark`. Parents can't visualize where someone lives. Fix: photo band (facade, room, dapur, mushola) + a "peta asal pulau penghuni". -> $impeccable bolder
- [P1] No cost information — "Hemat & terjangkau" with no figure (`asrama.ts:104-105`). Fix: show an explicit iuran range + what it covers. -> $impeccable clarify
- [P2] Flat section rhythm / pattern filler — 10 uniform sections; 7 backgrounds rotated. Fix: let one section dominate (full-bleed photo band or scaled-up Wilayah explorer); retire semantically empty patterns. -> $impeccable layout
- [P2] Fragmented CTA language — "Daftar" / "Daftar menjadi penghuni" / "Daftar sekarang" / "Mulai daftar" all -> `/register`. Pick one verb phrase. -> $impeccable clarify
- [P3] Duplicated stats & motifs — `"5 + 2"` & `"±2.408"` in hero + Wilayah; IslandMark hero card copied into CTA. -> $impeccable distill

## Persona Red Flags
- Jordan (first-timer): no photos/address/map; fee unknown despite "hemat" claim; requirements appear only after the CTAs he taps first; four "Daftar" labels make him doubt they're one flow.
- Riley (stress tester): Wilayah tabs not routable (`wilayah.tsx:67-77`) — refresh always resets to Anambas; `"5 + 2"` reads as a leaked computation; enum leak `"ASSIGNED/SHARED"` waiting to surface; marquee duplicates DOM and is un-pauseable.
- Casey (mobile): ~10 stacked sections, no sticky bottom CTA / back-to-top; auto-marquee competes right under the hero; fasilitas bento collapses to one long column (`fasilitas.tsx:28`); contact is plain text — no tappable WhatsApp.

## Minor Observations
- Header 3-color accent strip (`public-layout.tsx:40-44`) is a nice brand-coded detail; teal/orange contrast both clear AA.
- `cta.tsx` "Masuk" link (`:59-64`) has `underline` but no `focus-visible:ring` utility (other links carry `focusRing`).
- `pengenalan.tsx:201` `text-main-foreground/80` on teal ~3.7:1 -> below AA for normal text.
- `buttonVariants` forces `whitespace-nowrap` (`button.tsx:9`); long `size:'lg'` labels can overflow <=360px.
- `index.html` lacks `og:image` (+ no `twitter:card`).
- "Dikelola oleh pengurus asrama" (`public-layout.tsx:236`) is vague — name the body.
- `fasilitasKamar` (`fasilitas.ts:114-157`) is defined but unrendered on landing.
- Heading order is valid; no color-only meaning; negative ornaments wrapped in `overflow-hidden` (low x-scroll risk).

## Questions to Consider
1. If you swapped the copy for "Kos Melati," would the layout change at all — what section could exist only for a Kepri dorm?
2. The page sells kekeluargaan sedaerah yet shows a dome icon and no real room or face. What does that avoidance say to a parent?
3. Seven backgrounds across ten sections — are they carrying meaning, or hiding that sections lack individual identity?

## Run Notes
Target slug `src-routes-public-index-tsx` · ignore list: none · assessment independence: isolated parallel sub-agents (dual-agent) · CLI detector: exit 0, 0 landing findings (sanity 11 in `ui/`) · browser visibility: unavailable · overlay injection: not attempted (fallback signal = static pass) · live-server cleanup: n/a.
