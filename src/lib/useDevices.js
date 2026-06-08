// src/lib/useDevices.js
"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const OUI_MAP = {
  "00:1A:2B": "Apple",
  "A4:C3:F0": "Apple",
  "F0:18:98": "Apple",
  "00:50:F2": "Microsoft",
  "28:18:78": "Samsung",
  "8C:77:12": "Samsung",
  "00:1D:0F": "Samsung",
  "18:F6:43": "TP-Link",
  "50:C7:BF": "TP-Link",
  "00:0C:29": "VMware",
  "08:00:27": "VirtualBox",
  "B8:27:EB": "Raspberry Pi",
  "DC:A6:32": "Raspberry Pi",
};

export function detectVendor(mac = "") {
  if (!mac) return "Unknown";
  const prefix = mac.toUpperCase().slice(0, 8);
  return OUI_MAP[prefix] ?? "Unknown";
}

export function useDevices() {
  const [devices, setDevices] = useState([]);
  const [notifications, setNotifs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const notifId = useRef(0);
  const pingLoop = useRef(null);
  const devicesRef = useRef([]);
  const [pingsReady, setPingsReady] = useState(false);

  // Keep devicesRef always in sync with latest devices state
  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  const pushNotif = useCallback((type, device) => {
    const n = { id: ++notifId.current, type, device, ts: Date.now() };
    setNotifs((prev) => [n, ...prev].slice(0, 50));
  }, []);

  // ─── Initial scan ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.electronAPI) return;
    setScanning(true);
    window.electronAPI.startScan().then((result) => {
      setScanning(false);
      console.log("RAW SCAN RESULT:", JSON.stringify(result, null, 2));
      if (result?.error) {
        setPermissionError(true);
        return;
      }
      if (result?.length) {
        setDevices(
          result.map((d) => ({
            ...d,
            hostname: d.hostname && d.hostname !== d.ip ? d.hostname : d.ip,
            vendor: d.vendor || detectVendor(d.mac),
          })),
        );
      } else {
        setPermissionError(true);
      }
    });
  }, []);

  // ─── Live device events ─────────────────────────────────────────────────
  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;
    api.onDeviceJoin((d) => {
      setDevices((prev) => [...prev, { ...d, vendor: detectVendor(d.mac) }]);
      pushNotif("join", d);
    });
    api.onDeviceLeave((d) => {
      setDevices((prev) =>
        prev.map((x) => (x.id === d.id ? { ...x, online: false } : x)),
      );
      pushNotif("leave", d);
    });
    api.onDeviceUpdate((d) =>
      setDevices((prev) =>
        prev.map((x) => (x.id === d.id ? { ...x, ...d } : x)),
      ),
    );
    return () => {
      api.removeAllListeners("device:join");
      api.removeAllListeners("device:leave");
      api.removeAllListeners("device:update");
    };
  }, [pushNotif]);

  // ─── Ping loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.electronAPI || devices.length === 0) return;

    if (pingLoop.current) clearInterval(pingLoop.current);

    const pingAll = async () => {
      const online = devicesRef.current.filter((d) => d.online);
      for (const d of online) {
        const res = await window.electronAPI.pingHost(d.ip);
        setDevices((prev) =>
          prev.map((x) =>
            x.id === d.id
              ? {
                  ...x,
                  ping: res.alive ? Math.round(res.time) : null,
                  online: res.alive,
                }
              : x,
          ),
        );
      }
      setPingsReady(true); // ← fires after first full pass
    };

    pingAll();
    pingLoop.current = setInterval(pingAll, 5000);

    return () => clearInterval(pingLoop.current);
  }, [devices.length]);

  // ─── Manual rescan ──────────────────────────────────────────────────────
  const startScan = useCallback(async () => {
    setScanning(true);
    setPingsReady(false);
    setDevices([]);
    if (window.electronAPI) {
      const result = await window.electronAPI.startScan();
      if (result?.length) {
        setDevices(
          result.map((d) => ({
            ...d,
            hostname: d.hostname && d.hostname !== d.ip ? d.hostname : d.ip,
            vendor: d.vendor || detectVendor(d.mac),
          })),
        );
      }
    }
    setScanning(false);
  }, []);

  return {
    devices,
    notifications,
    scanning,
    startScan,
    permissionError,
    pingsReady,
  };
}
