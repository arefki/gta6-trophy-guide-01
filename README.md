# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/arefki/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/arefki/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — all 55 GTA 6 trophies in one offline guide and tracker: official names, descriptions and grades, a guide to each trophy that cites its sources, a three-step roadmap to the platinum, a warning for the one possibly missable trophy, and an interactive checklist that saves in your browser.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=v4nm4nhq&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

## What this is

An offline web app that guides and tracks all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze; 1,000 Gamerscore on Xbox). It runs from its own files with the network off — no CDN, no fonts, no remote images, no tracking.

- **Trophy browser** — all 55 trophies with official names, descriptions and grades, a guide to each in the author's own words with named sources, search, and filters by grade, kind, hidden/visible, missable, unconfirmed trigger, and not-earned-yet. A spoiler setting hides story trophies until they are earned.
- **Tracker** — tick trophies as earned; progress (trophies + Gamerscore + percentage) saves in `localStorage`, with export to a file and import back.
- **Roadmap to the platinum** — three steps (story 60–80h, 100% checklist ~100h, Strangers &amp; Freaks + cleanup ~10h) plus the golden rules: no cheats during the run, never chase the Irredeemable profile.
- **Missable warning** — Positive Mental Attitude: the Chapter 1 meditation spot that can disappear forever, with the exact steps and a save strategy.
- **100% Completion checklist** — the 35 items behind A Long Road, in three groups, each checkable with its own progress bar.
- **Comparison** — GTA 6 vs GTA V vs Red Dead Redemption 2, and a FAQ.

## Try it locally

```sh
# Serve app/ and open http://localhost:8080
cd app && python3 -m http.server 8080
```

Or generate the graded output the same way the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# out/ then holds app/, screenshots/ and dossier.json
```

## Layout

```
main.ts                  # entrypoint: copies app/ + screenshots/ to the output dir, writes dossier.json
vendor/makefun-frontend.ts  # the kit's dossier library, unchanged
app/
  index.html             # the guide shell: hero, glance, missable warning, roadmap, browser, checklist, comparison, FAQ, sources
  css/theme.css          # "Leonida after dark" neon-noir theme, system fonts only
  js/main.js             # boot: loads the data, wires search, filters, spoiler switch, export/import
  js/store.js            # localStorage progress, export/import, reset
  js/filters.js          # search, kind filters, spoiler rule, "next up" hint
  js/render.js           # trophy cards, 100% checklist, progress bars
  js/format.js           # grade icons (inline SVG), text escaping
  data/trophies.json     # all 55 trophies: official name/description/grade, Gamerscore, kind, flags, guide, sources
  data/checklist.json    # the 35-item 100% Completion checklist
  data/sources.json      # the cited sources, with links
screenshots/              # 4 renders of the guide running in desktop Chrome
```

## Data honesty

Rockstar has not published an official trophy list yet. The 55 names, descriptions and grades are reported from PSN/Xbox data (Exophase, PSNProfiles — the two agree on every entry) and guide sites (PowerPyx, GTABase). Gamerscore values are reported from GTABase via GTA Zone and sum to exactly 1,000G. Five trophy triggers are still unknown to anyone and are marked “Trigger unconfirmed” in the guide, with their best guesses labelled as guesses. Difficulty labels are estimates. No rarity percentages are shown for GTA 6 — the game launched on 19 November 2026 and none exist yet.

## License

MIT. See [LICENSE](LICENSE).
