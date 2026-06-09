"use client";
import { useState, useEffect, useRef } from "react";
import { Wifi, WifiOff, X } from "lucide-react";

const TTL = 5000;

function Toast({ n, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(n.id), 280);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(n.id), 280);
    }, TTL);
    return () => clearTimeout(t);
  }, [n.id]);

  const isJoin = n.type === "join";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        background: "var(--surface2, #111827)",
        border: `1px solid ${isJoin ? "var(--green, #22d3a0)" : "var(--red, #f43f5e)"}`,
        borderRadius: 10,
        minWidth: 260,
        maxWidth: 320,
        boxShadow: `0 4px 24px ${isJoin ? "#22d3a022" : "#f43f5e22"}, 0 1px 4px #0008`,
        animation: exiting
          ? "notif-out 0.28s ease forwards"
          : "notif-in 0.25s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 2,
          width: "100%",
          background: isJoin ? "var(--green, #22d3a0)" : "var(--red, #f43f5e)",
          opacity: 0.35,
          animation: `notif-progress ${TTL}ms linear forwards`,
          transformOrigin: "left",
        }}
      />

      {/* icon */}
      <div
        style={{
          marginTop: 1,
          color: isJoin ? "var(--green, #22d3a0)" : "var(--red, #f43f5e)",
          flexShrink: 0,
        }}
      >
        {isJoin ? <Wifi size={16} /> : <WifiOff size={16} />}
      </div>

      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "var(--mono, monospace)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: isJoin ? "var(--green, #22d3a0)" : "var(--red, #f43f5e)",
            textTransform: "uppercase",
            marginBottom: 3,
          }}
        >
          {isJoin ? "Device joined" : "Device left"}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text, #f1f5f9)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {n.device.hostname}
        </div>
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--mono, monospace)",
            color: "var(--text-dim, #64748b)",
            marginTop: 2,
          }}
        >
          {n.device.ip}
          {n.device.vendor && n.device.vendor !== "Unknown" && (
            <span style={{ marginLeft: 6, opacity: 0.6 }}>
              · {n.device.vendor}
            </span>
          )}
        </div>
      </div>

      {/* dismiss */}
      <button
        onClick={dismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-dim, #64748b)",
          padding: 2,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          marginTop: 1,
          borderRadius: 4,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--text, #f1f5f9)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--text-dim, #64748b)")
        }
      >
        <X size={13} />
      </button>

      <style>{`
        @keyframes notif-in {
          from { opacity: 0; transform: translateX(20px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes notif-out {
          from { opacity: 1; transform: translateX(0)    scale(1);    max-height: 120px; margin-bottom: 0; }
          to   { opacity: 0; transform: translateX(20px) scale(0.97); max-height: 0;     margin-bottom: -8px; }
        }
        @keyframes notif-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
// Props:
//   devices  — current array of online devices (from your scan state)
//
// Internally diffs vs previous snapshot to produce join/leave events.
// You can also pass `items` directly if you already compute events upstream.

export default function Notifications({ devices = [], items: externalItems }) {
  const [toasts, setToasts] = useState([]);
  const prevDevicesRef = useRef(null);

  // Mode 1: caller passes raw device list → we diff internally
  useEffect(() => {
    if (externalItems) return; // skip if using external items mode
    if (prevDevicesRef.current === null) {
      prevDevicesRef.current = devices;
      return;
    }

    const prev = prevDevicesRef.current;
    const prevIds = new Set(prev.map((d) => d.id ?? d.ip));
    const currIds = new Set(devices.map((d) => d.id ?? d.ip));

    const joined = devices.filter((d) => !prevIds.has(d.id ?? d.ip));
    const left = prev.filter((d) => !currIds.has(d.id ?? d.ip));

    const newToasts = [
      ...joined.map((device) => ({
        id: `join-${device.ip}-${Date.now()}`,
        type: "join",
        device,
      })),
      ...left.map((device) => ({
        id: `leave-${device.ip}-${Date.now()}`,
        type: "leave",
        device,
      })),
    ];

    if (newToasts.length) {
      setToasts((t) => [...newToasts, ...t].slice(0, 5));
    }

    prevDevicesRef.current = devices;
  }, [devices, externalItems]);

  // Mode 2: caller passes pre-computed event items (original API)
  useEffect(() => {
    if (!externalItems || !externalItems.length) return;
    const latest = externalItems[0];
    setToasts((t) =>
      [latest, ...t.filter((x) => x.id !== latest.id)].slice(0, 5),
    );
  }, [externalItems]);

  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999,
        alignItems: "flex-end",
      }}
    >
      {toasts.map((n) => (
        <Toast key={n.id} n={n} onDismiss={dismiss} />
      ))}
    </div>
  );
}
