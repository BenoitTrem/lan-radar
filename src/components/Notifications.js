// src/components/Notifications.js
"use client";
import { useState, useEffect } from "react";

const TTL = 5000;

export default function Notifications({ items }) {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (!items.length) return;
    const latest = items[0];
    setVisible(v => [latest, ...v.filter(x => x.id !== latest.id)].slice(0, 5));
    const t = setTimeout(() => setVisible(v => v.filter(x => x.id !== latest.id)), TTL);
    return () => clearTimeout(t);
  }, [items]);

  if (!visible.length) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column-reverse", gap: 8, zIndex: 999,
    }}>
      {visible.map(n => (
        <div key={n.id} style={{
          padding: "10px 16px", background: "var(--surface2)",
          border: `1px solid ${n.type === "join" ? "var(--green)" : "var(--red)"}`,
          borderRadius: 8, fontSize: 13, animation: "notif-in .25s ease",
          boxShadow: `0 0 16px ${n.type === "join" ? "#22d3a030" : "#f43f5e30"}`,
          minWidth: 240,
        }}>
          <span style={{ color: n.type === "join" ? "var(--green)" : "var(--red)", fontFamily: "var(--mono)", fontSize: 11 }}>
            {n.type === "join" ? "▲ JOINED" : "▼ LEFT"}
          </span>
          <div style={{ marginTop: 4, fontWeight: 500 }}>{n.device.hostname}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-dim)" }}>{n.device.ip}</div>
        </div>
      ))}
    </div>
  );
}
