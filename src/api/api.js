import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// ─────────────────────────────────────────────
// Axios instance with automatic JWT injection
// ─────────────────────────────────────────────

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every request (if available)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 responses
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-logout on the login endpoint itself
      const url = error.config?.url || "";
      if (!url.includes("/api/auth/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("selectedSiteId");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


// ══════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════

export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const res = await api.post("/api/auth/login", { email, password });
    return res.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw (
      error.response?.data || {
        message: "Unable to login. Please try again.",
      }
    );
  }
}


// ══════════════════════════════════════════════
//  SITES
// ══════════════════════════════════════════════

export async function getSites() {
  const res = await api.get("/api/sites");
  return res.data;
}

export async function getSiteById(id) {
  const res = await api.get(`/api/sites/${id}`);
  return res.data;
}


// ══════════════════════════════════════════════
//  ANALYTICS
// ══════════════════════════════════════════════

/**
 * Count total number of entries during a period (NOT unique visitors).
 * @returns {{ siteId, fromUtc, toUtc, footfall }}
 */
export async function getFootfall({ siteId, fromUtc, toUtc }) {
  const res = await api.post("/api/analytics/footfall", {
    siteId,
    fromUtc,
    toUtc,
  });
  return res.data;
}

/**
 * Get average dwell duration (minutes) for a site within a period.
 * @returns {{ siteId, fromUtc, toUtc, avgDwellMinutes, dwellRecords }}
 */
export async function getDwell({ siteId, fromUtc, toUtc }) {
  const res = await api.post("/api/analytics/dwell", {
    siteId,
    fromUtc,
    toUtc,
  });
  return res.data;
}

/**
 * Get hourly occupancy analytics for a site.
 * @returns occupancy buckets for the given time range
 */
export async function getOccupancy({ siteId, fromUtc, toUtc }) {
  const res = await api.post("/api/analytics/occupancy", {
    siteId,
    fromUtc,
    toUtc,
  });
  return res.data;
}

/**
 * Get hourly gender demographics analytics for a site.
 * @returns male/female counts for each hour bucket
 */
export async function getDemographics({ siteId, fromUtc, toUtc }) {
  const res = await api.post("/api/analytics/demographics", {
    siteId,
    fromUtc,
    toUtc,
  });
  return res.data;
}

/**
 * Get combined entry–exit session history for a site (paginated).
 * @returns {{ siteId, totalRecords, totalPages, pageNumber, pageSize, records }}
 */
export async function getEntryExit({
  siteId,
  fromUtc,
  toUtc,
  pageSize = 10,
  pageNumber = 1,
}) {
  const res = await api.post("/api/analytics/entry-exit", {
    siteId,
    fromUtc,
    toUtc,
    pageSize,
    pageNumber,
  });
  return res.data;
}


// ══════════════════════════════════════════════
//  SIMULATION
// ══════════════════════════════════════════════

export async function startSimulation() {
  const res = await api.get("/api/sim/start");
  return res.data;
}

export async function stopSimulation() {
  const res = await api.get("/api/sim/stop");
  return res.data;
}


// ══════════════════════════════════════════════
//  HEALTH
// ══════════════════════════════════════════════

export async function healthCheck() {
  const res = await api.get("/api/health");
  return res.data;
}

export async function secureHealthCheck() {
  const res = await api.get("/api/health/secure");
  return res.data;
}


// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════

/**
 * Build "today" time range in UTC epoch-millis.
 * Returns { fromUtc, toUtc } spanning midnight-to-now (UTC).
 */
export function getTodayRange() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  return {
    fromUtc: startOfDay.getTime(),
    toUtc: now.getTime(),
  };
}

/**
 * Build a custom day range in UTC epoch-millis.
 */
export function getDayRange(daysAgo = 0) {
  const now = new Date();
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - daysAgo);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCHours(23, 59, 59, 999);

  // If today, cap at now
  if (daysAgo === 0) {
    return { fromUtc: start.getTime(), toUtc: now.getTime() };
  }
  return { fromUtc: start.getTime(), toUtc: end.getTime() };
}
