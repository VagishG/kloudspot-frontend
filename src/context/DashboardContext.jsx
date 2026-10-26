import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSites } from "../api/api";

const DashboardContext = createContext(null);

function getSiteMidnightUtc(now, timezone) {
  if (!timezone) return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  try {
    const dateParts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(now);
    const date = Object.fromEntries(dateParts.map((part) => [part.type, Number(part.value)]));
    const desiredMidnight = Date.UTC(date.year, date.month - 1, date.day);
    let candidate = desiredMidnight;

    // Adjust the UTC guess until it represents midnight in the site's timezone.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const localParts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hourCycle: "h23",
      }).formatToParts(new Date(candidate));
      const local = Object.fromEntries(localParts.map((part) => [part.type, Number(part.value)]));
      const representedAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
      candidate += desiredMidnight - representedAsUtc;
    }
    return candidate;
  } catch {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
}

export function DashboardProvider({ children }) {
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState(() => localStorage.getItem("siteId") || "");
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState("");

  useEffect(() => {
    let active = true;
    getSites()
      .then((data) => {
        if (!active) return;
        const availableSites = Array.isArray(data) ? data : [];
        setSites(availableSites);
        setSiteId((current) => {
          const hasCurrentSite = availableSites.some((site) => site.siteId === current);
          const nextSiteId = hasCurrentSite ? current : (availableSites[0]?.siteId || "");
          if (nextSiteId) localStorage.setItem("siteId", nextSiteId);
          else localStorage.removeItem("siteId");
          return nextSiteId;
        });
      })
      .catch((error) => {
        if (active) setSitesError(error.message);
      })
      .finally(() => {
        if (active) setSitesLoading(false);
      });

    return () => { active = false; };
  }, []);

  const selectedSite = sites.find((site) => site.siteId === siteId) || null;
  const range = useMemo(() => {
    const now = new Date();
    return {
      fromUtc: getSiteMidnightUtc(now, selectedSite?.timezone),
      toUtc: now.getTime(),
    };
  }, [selectedSite?.timezone]);

  function selectSite(nextSiteId) {
    setSiteId(nextSiteId);
    if (nextSiteId) localStorage.setItem("siteId", nextSiteId);
  }

  const value = {
    sites,
    siteId,
    selectedSite,
    selectSite,
    sitesLoading,
    sitesError,
    range,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used inside DashboardProvider");
  return context;
}
