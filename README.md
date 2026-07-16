# lively-mobile

> The family app for Lively — set up a WhatsApp companion for your parent, watch the conversation, track their strength progress.

**Status:** 📐 Pre-build spec — see [SPEC.md](SPEC.md) and [PLAN.md](PLAN.md). Shared core: [CORE.md](CORE.md).

| | |
|---|---|
| Hackathon | Garuda Hacks 7.0 |
| Submit by | 2026-07-18 · exact time 🔴 TBD · prize 🔴 TBD |
| Track | Health |
| Gate | Working demo + repo + pitch deck submitted |
| Stack | TypeScript · Expo (React Native) · NativeWind 🟡 (Tailwind styling — confirm before building) |

Four screens: My Companion, Chat Monitor, Progress, Alerts. Talks only to `lively-backend` — never touches the DB or WhatsApp directly. See [CORE.md](CORE.md) for the API contract.

## Notes

- Public repo. No secrets in source — config via env vars only (`.env.example` documents names; real values live in a gitignored `.env`).
- Part of a 4-repo Lively build (`lively-landing`, `lively-mobile`, `lively-backend`, `lively-bot`) sharing [CORE.md](CORE.md) verbatim.
- Tailwind/shadcn/reactbits were requested for faster dev across the project — those are web-only tools. For this repo the closest equivalents are NativeWind (Tailwind for RN) and a component kit like `react-native-reusables` (shadcn-style primitives ported to RN). Not yet confirmed — see PLAN.md Day 1.

## License

MIT — see LICENSE.
