import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getSites } from "../api/api";

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all sites on mount
  const fetchSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSites();
      const siteList = Array.isArray(data) ? data : [];
      setSites(siteList);

      // Restore previously selected site or default to first
      const savedId = localStorage.getItem("selectedSiteId");
      const saved = siteList.find((s) => s.siteId === savedId);

      if (saved) {
        setSelectedSite(saved);
      } else if (siteList.length > 0) {
        setSelectedSite(siteList[0]);
        localStorage.setItem("selectedSiteId", siteList[0].siteId);
      }
    } catch (err) {
      console.error("Failed to fetch sites:", err);
      setError(err?.message || "Failed to load sites");
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
