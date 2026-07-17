<p align="center">
  <img src="assets/images/icon.png" alt="Lively logo" width="96" />
</p>

<h1 align="center">lively-mobile</h1>

<p align="center">The family app for <strong>Lively</strong> — set up a WhatsApp companion for your parent, watch the conversation, and track their strength progress.</p>

> [!NOTE]
> Built for **Garuda Hacks 7.0** (Health track). Part of a four-repo system — `lively-landing`, `lively-mobile`, `lively-backend`, `lively-bot` — sharing a common data/API contract documented in [CORE.md](CORE.md).

## About

An adult child uses this app to configure a WhatsApp companion persona (Mbak Asih or Mas Budi) for their elderly parent, then keeps an eye on things from a distance: a read-only view of the WhatsApp conversation, health and engagement progress (Chair Stand scores, exercise streaks, medication adherence), routine medication management, and safety alerts (missed days, pain or dizziness mentions, no response, emergencies).

The app never touches the database or WhatsApp directly — everything goes through a JWT-authenticated REST API on [`lively-backend`](../lively-backend).

## Tech stack

- Expo SDK 54 (managed workflow), React Native 0.81, React 19, TypeScript
- `expo-router` for file-based, typed navigation
- `@tanstack/react-query` for data fetching and caching
- `expo-secure-store` (tokens), `expo-notifications` (push), `@react-native-community/netinfo` (offline detection)
- `react-native-reanimated` / `react-native-svg` for animation and charts

## Getting started

### Prerequisites

- Node.js 20+
- Expo Go app (for on-device testing) or an iOS/Android simulator

### Install and run

```bash
npm install
cp .env.example .env   # fill in the values below
npm start               # expo start
```

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run in a browser |
| `npm run lint` | Run `expo lint` |

### Configuration

Set these in `.env` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `BACKEND_API_URL` | Base URL of `lively-backend` |
| `EXPO_PUBLIC_USE_MOCKS` | Set to run against mock data instead of a live backend |

> [!WARNING]
> Never commit real values — `.env` is gitignored. Only `.env.example` (names, no secrets) belongs in source control.

## Project structure

```
app/
├── (auth)/            # login, register
└── (app)/(tabs)/      # Home, Chat monitor, Progress, Alerts
    ├── setup-wizard, medications, titipan, alert detail, report, profile, settings

components/            # organized by domain (alerts, chat, home, medications, progress, setup, titipan, ui)
hooks/                  # useAuthStatus, useIsOffline, usePushRegistration
lib/
├── api/                # client, endpoints, hooks, types, errors
├── auth/               # token storage
└── query/               # react-query client and helpers
```

