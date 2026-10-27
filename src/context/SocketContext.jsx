import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useSite } from "./SiteContext";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;

const LIVE_OCCUPANCY_EVENTS = [
  "live-occupancy",
  "live occupancy",
  "liveOccupancy",
  "occupancy",
];

const MAX_ALERTS = 50;

function firstValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== ""
  );
}

function unwrapPayload(payload) {
  if (payload && typeof payload === "object" && payload.data) {
    return payload.data;
  }
  return payload && typeof payload === "object" ? payload : {};
}

function normalizeAlert(payload) {
  const data = unwrapPayload(payload);
  const actionValue = String(
    firstValue(
      data.action,
      data.actionType,
      data.type,
      data.eventType,
      "entry"
    )
  ).toLowerCase();

  return {
    id:
      firstValue(data.id, data.eventId, data.alertId) ||
      `${Date.now()}-${Math.random()}`,
    action: actionValue.includes("exit") ? "exit" : "entry",
    personName: firstValue(
      data.personName,
      data.name,
      data.person?.name,
      data.visitorName
    ),
    zone: firstValue(
      data.zoneName,
      data.zone?.name,
      data.zoneId,
      data.zone?.id,
      data.zone
    ),
    siteId: firstValue(data.siteId, data.site?.siteId, data.site?.id),
    siteName: firstValue(data.siteName, data.site?.name),
    severity: firstValue(data.severity, data.priority, data.level),
    time:
      firstValue(
        data.time,
        data.timestamp,
        data.createdAt,
        data.entryLocal,
        data.exitLocal
      ) || Date.now(),
  };
}

function normalizeOccupancy(payload) {
  const data = unwrapPayload(payload);
  const countValue = firstValue(
    data.occupancy,
    data.count,
    data.liveOccupancy,
    data.value,
    data.current,
    data.people
  );
  const count = Number(countValue);

  return {
    count: Number.isFinite(count) ? count : null,
    zoneId: firstValue(data.zoneId, data.zone?.id, data.zone?.zoneId),
    siteId: firstValue(data.siteId, data.site?.siteId, data.site?.id),
    time: firstValue(data.time, data.timestamp, data.createdAt) || Date.now(),
  };
}

export function SocketProvider({ children }) {
  const { selectedSite } = useSite();
  const selectedSiteRef = useRef(selectedSite);

  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [siteLevelOccupancy, setSiteLevelOccupancy] = useState(null);
  const [zoneOccupancy, setZoneOccupancy] = useState({});

  useEffect(() => {
    selectedSiteRef.current = selectedSite;
  }, [selectedSite]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !SOCKET_URL) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    function matchesSelectedSite(siteId) {
      const currentSiteId = selectedSiteRef.current?.siteId;
      if (!siteId || !currentSiteId) return true;
      return String(siteId) === String(currentSiteId);
    }

    function handleAlert(payload) {
      const alert = normalizeAlert(payload);
      if (!matchesSelectedSite(alert.siteId)) return;

      setAlerts((previous) => [alert, ...previous].slice(0, MAX_ALERTS));
    }

    function handleOccupancy(payload) {
      const occupancy = normalizeOccupancy(payload);
      if (occupancy.count == null) return;
      if (!matchesSelectedSite(occupancy.siteId)) return;

      if (occupancy.zoneId) {
        setZoneOccupancy((previous) => ({
          ...previous,
          [occupancy.zoneId]: occupancy,
        }));
      } else {
        setSiteLevelOccupancy(occupancy);
      }
    }

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("alert", handleAlert);

    LIVE_OCCUPANCY_EVENTS.forEach((eventName) => {
      socket.on(eventName, handleOccupancy);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("alert", handleAlert);
      LIVE_OCCUPANCY_EVENTS.forEach((eventName) => {
        socket.off(eventName, handleOccupancy);
      });
      socket.disconnect();
      setConnected(false);
    };
  }, []);

  useEffect(() => {
    setAlerts([]);
    setSiteLevelOccupancy(null);
    setZoneOccupancy({});
  }, [selectedSite?.siteId]);

  const liveOccupancy = useMemo(() => {
    const zones = Object.values(zoneOccupancy);

    if (zones.length > 0) {
      const latest = zones.reduce((latestZone, zone) =>
        zone.time > latestZone.time ? zone : latestZone
      );

      return {
        count: zones.reduce((total, zone) => total + zone.count, 0),
        time: latest.time,
      };
    }

    return siteLevelOccupancy;
  }, [siteLevelOccupancy, zoneOccupancy]);

  const value = {
    connected,
    alerts,
    liveOccupancy,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
