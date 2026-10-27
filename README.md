# Kloudspot Crowd Management

A responsive React dashboard for monitoring mall occupancy and visitor traffic. It shows footfall, dwell time, live occupancy, demographic splits, and paginated entry–exit sessions for the selected site.

## Features

- JWT authentication with automatic logout on `401`
- Site selector with site-timezone-aware date ranges
- Dashboard KPIs with previous-period comparison indicators
- Live occupancy and alert updates over Socket.IO
- Hourly occupancy and demographic charts
- Entry–exit table with date filters and pagination
- Responsive layout with a mobile drawer navigation
- Stale-while-revalidate caching for fast loads on slow connections
- Lazy-loaded routes to keep the login bundle small

## Tech stack

- React 19
- Vite 8
- React Router
- Tailwind CSS 4
- Recharts
- Axios
- Socket.IO Client
- ESLint

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- pnpm (recommended)
- Access to the Kloudspot backend API and valid login credentials

## Getting started

```bash
pnpm install
cp .env.example .env
```

Update `.env` with the backend URLs, then start the dev server:

```bash
pnpm dev
```

Vite prints the local URL, usually `http://localhost:5173`.

Use the credentials issued by your backend administrator to sign in.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend API base URL, without a trailing slash. |
| `VITE_SOCKET_URL` | No | Socket.IO server URL. Defaults to `VITE_API_URL`. |

Example:

```dotenv
VITE_API_URL=https://hiring-dev.internal.kloudspot.com
VITE_SOCKET_URL=https://hiring-dev.internal.kloudspot.com
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server with HMR. |
| `pnpm build` | Create a production build in `dist/`. |
| `pnpm preview` | Preview the production build locally. |
| `pnpm lint` | Run ESLint over the project. |

## Project structure

```text
src/
├── api/            Axios client and API helpers
├── components/     Shared UI, sidebar, topbar, notifications
├── context/        Site selection and Socket.IO providers
├── pages/          Login, dashboard shell, Home, Crowd Entries
├── utils/          Date ranges, analytics formatting, caching
├── routes.jsx      Route definitions and lazy loading
└── main.jsx        App entry point
```

## Data loading and caching

The app uses a stale-while-revalidate pattern:

- Cached data is rendered immediately when available.
- Fresh data is requested in the background.
- If the backend is slow or unavailable, cached data remains visible.
- Site lists are cached in `localStorage` for 24 hours.
- Dashboard analytics are cached in `localStorage` for 5 minutes.
- Entry–exit records are cached in `sessionStorage` for 2 minutes because they contain visitor names.
- Caches are cleared on logout and on automatic `401` logout.

API requests time out after 12 seconds. Dashboard analytics requests run in parallel.

## API notes

- All authenticated requests send `Authorization: Bearer <token>`.
- Analytics endpoints are grouped under `/api/analytics/`.
- Date ranges are converted to UTC using the selected site's timezone.
- The entry–exit endpoint does not currently return a gender field, so that column is omitted. Aggregate male/female demographics are available from the demographics endpoint.
## Real-time updates (Socket.IO)

I kept the socket in one provider (`src/context/SocketContext.jsx`) instead of opening a connection from each page. It sits inside `DashboardLayout`, so the connection survives navigation between Home and Crowd Entries and is closed when the dashboard unmounts.

The client connects with the JWT in the Socket.IO `auth` object and also in the query string. I included the query token because the backend handshake wasn't documented; once that's confirmed, the query token can be removed. The transport is WebSocket with polling fallback, and Socket.IO handles reconnection automatically.

The event contract wasn't documented, so I didn't hard-code one payload shape. Alerts come from the `alert` event. Live occupancy listens for `live-occupancy`, `live occupancy`, `liveOccupancy`, and `occupancy`, then runs each payload through a small normalizer before updating state. Anything that can't be matched to the selected site is ignored. The socket stays connected when the site changes; a ref holds the current site so switching sites doesn't tear down and recreate the connection. Alerts and occupancy state are cleared on a site switch.

If occupancy messages include a `zoneId`, I keep a map of zone values and sum them for the site total. Otherwise I use the latest site-level count. Home uses the socket value when available and falls back to the last API occupancy bucket until the first socket message arrives. Alerts live in the provider, newest first, capped at 50, and both the Topbar dot and NotificationPanel read from the same list.

A few things I'd tighten once the backend contract is confirmed: remove the token from the query string, subscribe to a site-specific room instead of filtering every event in the browser, and replace the flexible event/payload handling with one fixed schema. For now that flexibility is intentional because I didn't have a reliable contract to code against.

## Deployment

Build the app:

```bash
pnpm build
```

Deploy the contents of `dist/` to a static host. Because the app uses client-side routing, configure the host to rewrite unknown paths to `index.html` so routes such as `/dashboard/crowdentries` work on refresh.
