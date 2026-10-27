# Crowd Management Frontend — Requirements Gap Fix + Responsive Plan

## Findings (requirement audit)

| # | Requirement | Status |
|---|---|---|
| 5.1 | Login: email/login ID, masked password + toggle, redirect, inline error | Met |
| 5.1 | Security: credentials/tokens must never be logged | **FAIL** — `Login.jsx` logs the successful response (contains token) |
| 5.2 | Live Occupancy, Today's Footfall, Avg Dwell Time cards | Met (values wired) |
| 3 | Comparison indicators vs yesterday on the 3 cards | **MISSING** — cards only show descriptive text |
| 5.2 | Occupancy timeline chart | Met |
| 5.2 | Demographics pie + male/female timeline | Met |
| 5.3 | Entry/exit table: name, entry, exit, dwell, pagination | Met |
| 5.3 | Gender column | **BLOCKED** — Swagger `entry-exit` response has no gender field. User chose to omit and report the backend gap. |
| 6 | Socket.IO `alert` event (entry/exit, zone, site, severity) | **MISSING** — NotificationPanel builds "alerts" from a one-time entry-exit API call |
| 6 | Socket.IO `live occupancy` event updates dashboard | **MISSING** |
| 7 | UI independent of backend internals | Met (API only) |
| 8.1 | Dashboard load ~2–5s | At risk — Home fetches 3 groups sequentially; refactor to parallel |
| 8.1 | Pagination | Met |
| 8.2 | Protected pages require auth | Met |
| 8.3 | Scales gracefully across desktop viewports | **PARTIAL** — no mobile nav, topbar/headers can overflow, table relies only on horizontal scroll |
| — | "Today" should use site timezone | **BUG** — Home/CrowdEntries use UTC midnight, ignoring `site.timezone` |
| — | Root URL has no route | **BUG** — `/` renders a blank/no-match screen |

Backend contract reference: `https://hiring-dev.internal.kloudspot.com/api-docs/swagger-ui-init.js`
(Swagger confirms entry-exit fields: personId, personName, zoneId, zoneName, severity, entryUtc/Local, exitUtc/Local, dwellMinutes — **no gender**).

## Decisions confirmed with user
1. Implement Socket.IO because the doc requires it (repo has no client yet).
2. Do **not** add the Gender column; report it as a backend/doc gap.
3. Compute real % comparisons vs yesterday.

## Implementation plan

### 1. Socket.IO — alerts + live occupancy
- Add `socket.io-client` dependency (`pnpm add socket.io-client`).
- New `src/context/SocketContext.jsx`:
  - Connect only when a JWT exists, to `VITE_SOCKET_URL || VITE_API_URL`.
  - Authenticate via `auth: { token }`, `query: { token }`, and `extraHeaders: { Authorization: Bearer <token> }` for compatibility.
  - Reconnection enabled; disconnect/cleanup on unmount/logout.
  - Listen to `alert` and tolerant live-occupancy variants (`live-occupancy`, `live occupancy`, `liveOccupancy`, `occupancy`).
  - Normalize payload aliases: action/actionType/type, zone/zoneName/zoneId, site/siteId, severity, count/occupancy/liveOccupancy, timestamp.
  - Keep a capped `alerts` list (e.g. 50) and latest `liveOccupancy`.
  - Filter events by `selectedSite.siteId` when the payload has a site id.
  - Expose `{ alerts, liveOccupancy, connected }` through `useSocket()`.
- Mount `SocketProvider` inside `SiteProvider` in `DashboardLayout.jsx`.
- `NotificationPanel.jsx`: replace one-time `getEntryExit` fetch with `useSocket().alerts`; show action type (Entered/Exited), zone, site, severity, time; keep existing visual design.
- `Home.jsx`: use socket `liveOccupancy` for the Live Occupancy card when available (fallback to latest occupancy bucket); optionally update the last occupancy bucket.
- If the live backend rejects the handshake contract, verify `auth`/event names with provided credentials; make URL/event names configurable rather than scattering strings.

### 2. Comparison indicators (real % vs yesterday)
- Add timezone-aware range helpers (reuse logic currently in `DashboardContext.getSiteMidnightUtc`):
  - `getSiteDayRange(timezone, daysAgo, now)` → UTC millis for local site day.
  - Replace UTC `getTodayRange` / `getDayRange` usage in Home and CrowdEntries with the site-timezone version.
- Home: fetch all analytics in **parallel** via `Promise.allSettled`:
  - current range: footfall, dwell, occupancy, demographics
  - comparison range: previous day (same elapsed window for Today) footfall, dwell, occupancy
- Compute `% change = current vs previous`; render `X% More than yesterday` / `X% Less than yesterday` / `Same as yesterday`, with existing green/red styling (green = increase, red = decrease).
- For Live Occupancy, compare the current/last bucket with the same hour bucket from the previous day.
- Add stale-response guard (request id or AbortController) so rapid site/date switches cannot overwrite newer data.
- Keep the current card layout; only replace the descriptive subtext with real deltas.

### 3. Security fix
- Remove `console.log("Login successful:", data)` and the raw error log in `Login.jsx`.
- Keep inline error text; do not log response bodies/tokens anywhere.

### 4. Responsiveness (no major visual redesign)
- `DashboardLayout.jsx`:
  - `w-screen` → `w-full`.
  - Desktop sidebar unchanged: `hidden lg:block`.
  - Add mobile off-canvas drawer (same Sidebar) with backdrop, slide-in/out, close on nav/logout/backdrop; `w-64` only in the mobile wrapper.
  - Pass mobile menu handler to Topbar and close-on-navigate to Sidebar.
- `Topbar.jsx`:
  - Add `lg:hidden` hamburger button.
  - Hide brand/divider and language switch on very small widths; truncate site name; responsive gaps/padding (`px-3 sm:px-5`).
  - Add `aria-label`s to icon-only buttons.
- `Sidebar.jsx`: optional `onNavigate` callback so mobile drawer closes on tab click. No desktop width redesign.
- `Home.jsx`: responsive page padding; header stacks below `sm`; stat grid `grid-cols-1 sm:grid-cols-3`; chart heights shrink on mobile (`h-[240px] sm:h-[280px]` etc.); demographics grid stays single column until large.
- `CrowdEntries.jsx`: responsive page padding; header stacks below `sm`; keep horizontal table scroll but add responsive cell padding; pagination wraps.
- `Login.jsx`: small padding tweaks only; existing responsive behavior retained.
- `NotificationPanel.jsx`: already mobile-safe (`max-w-[90vw]`); keep.

### 5. Small correctness/UX fixes
- Add root redirect: `/` → `/login` (Login already forwards authenticated users to `/dashboard`).
- Update `index.html` title to “Crowd Management System”.
- Fix CrowdEntries page reset: when date/site changes, reset to page 1 before fetching (avoid a wasted request with the old page).
- Optional: use `minTickGap` on charts to prevent crowded hour labels on narrow screens.

### 6. Verification
- `pnpm lint` and `pnpm build`.
- Manual responsive checks at 375 / 768 / 1024 / 1440 px (Chromium/Playwright is available).
- Login → dashboard → crowd entries flow; site switch and date-range switch.
- Socket: confirm alerts stream into the panel and live occupancy updates the card; confirm reconnect and logout cleanup.
- Verify no token/credential logs remain.

## Known blocker to report
- Gender column cannot be populated because the authoritative Swagger `entry-exit` response has no gender field. Backend must add a gender field (e.g. `gender`/`sex`) for the doc requirement to be met. The UI will omit it per user decision.
