import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getSites } from "../api/api";
import { readCache, writeCache } from "../utils/dataCache";

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [initialCache] = useState(() => readCache("sites"));
  const initialSites = Array.isArray(initialCache?.data)
    ? initialCache.data
    : [];
  const savedId = localStorage.getItem("selectedSiteId");
  const initialSelectedSite =
    initialSites.find((site) => site.siteId === savedId) ||
    initialSites[0] ||
    null;

  const [sites, setSites] = useState(initialSites);
  const [selectedSite, setSelectedSite] = useState(initialSelectedSite);
  const [loading, setLoading] = useState(initialSites.length === 0);
  const [error, setError] = useState(null);
  const hasSitesRef = useRef(initialSites.length > 0);

  // Fetch all sites on mount
  const fetchSites = useCallback(async () => {
    if (!hasSitesRef.current) setLoading(true);
    setError(null);

    try {
      const data = await getSites();
      const siteList = Array.isArray(data) ? data : [];
      setSites(siteList);
      hasSitesRef.current = siteList.length > 0;
      writeCache("sites", siteList, 24 * 60 * 60 * 1000);

      // Restore previously selected site or default to first
      const latestSavedId = localStorage.getItem("selectedSiteId");
      const saved = siteList.find(
        (site) => site.siteId === latestSavedId
      );

      setSelectedSite((current) => {
        const currentMatch = siteList.find(
          (site) => site.siteId === current?.siteId
        );
        const nextSite = saved || currentMatch || siteList[0] || null;
        if (nextSite) {
          localStorage.setItem("selectedSiteId", nextSite.siteId);
        }
        return nextSite;
      });
    } catch (err) {
      if (!hasSitesRef.current) {
        setError(err?.message || "Failed to load sites");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // Select a site by its siteId
  const selectSite = useCallback(
    (siteId) => {
      const site = sites.find((s) => s.siteId === siteId);
      if (site) {
        setSelectedSite(site);
        localStorage.setItem("selectedSiteId", site.siteId);
      }
    },
    [sites]
  );

  return (
    <SiteContext.Provider
      value={{
        sites,
        selectedSite,
        selectSite,
        loading,
        error,
        refetchSites: fetchSites,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return ctx;
}
