// src/components/Sidebar.js
"use client";

import { Router, Activity, Gauge, AppWindow, Info } from "lucide-react";

const NAV = [
  { id: "devices", icon: Router, label: "Devices" },
  { id: "ping", icon: Activity, label: "Ping" },
  { id: "speed", icon: Gauge, label: "Speed" },
  { id: "apps", icon: AppWindow, label: "Apps" },
  { id: "about", icon: Info, label: "About" },
];

export default function Sidebar({ view, setView, devices, scanning, onScan }) {
  const online = devices.filter((d) => d.online).length;

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "0 20px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            color: "var(--accent)",
            fontSize: 18,
            letterSpacing: 2,
          }}
        >
          LAN RADAR
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5 }}>
          {online} / {devices.length} devices online
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "22px 12px" }}>
        {NAV.map((n) => {
          const Icon = n.icon;

          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`nav-btn ${view === n.id ? "active" : ""}`}
            >
              <Icon size={16} />
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* Scan button */}
      <div
        style={{ padding: "12px 12px", borderTop: "1px solid var(--border)" }}
      >
        <button
          onClick={onScan}
          disabled={scanning}
          className="scan-btn"
          title="Rescan network information."
        >
          {scanning ? "SCANNING…" : "SCAN NETWORK"}
        </button>

        <button
          className="reload-btn"
          onClick={() => {
            if (window.electronAPI) {
              window.electronAPI.reloadApp();
            } else {
              window.location.reload();
            }
          }}
          title="Restart the application."
        >
          RESTART APP
        </button>
      </div>
    </aside>
  );
}
