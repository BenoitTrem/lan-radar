// src/components/PingMonitor.js
"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MAX_POINTS = 30;

export default function PingMonitor({ devices, scanning, pingsReady }) {
  const online = devices.filter((d) => d.online);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState({});
  const [everHadPing, setEverHadPing] = useState(false);

  // Once any device gets a real ping, remember that forever
  useEffect(() => {
    if (!everHadPing && devices.some((d) => d.ping !== null)) {
      setEverHadPing(true);
    }
  }, [devices]);

  useEffect(() => {
    if (online.length && !selected) setSelected(online[0].id);
  }, [online]);

  useEffect(() => {
    online.forEach((d) => {
      setHistory((h) => {
        const prev = h[d.id] ?? [];
        const next = [
          ...prev,
          {
            t: new Date().toLocaleTimeString("en", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            ping: d.ping,
          },
        ].slice(-MAX_POINTS);
        return { ...h, [d.id]: next };
      });
    });
  }, [devices]);

  const data = history[selected] ?? [];
  const dev = devices.find((d) => d.id === selected);

  // Show spinner if: actively scanning, OR devices exist but none pinged yet
  if (scanning || (devices.length > 0 && !pingsReady)) {
    return (
      // ... rest of your spinner JSX unchanged
      <div>
        <h2
          style={{
            fontFamily: "var(--mono)",
            fontSize: 13,
            color: "var(--text-dim)",
            letterSpacing: 2,
            marginTop: 30,
            paddingBottom: 52,
          }}
        >
          PING MONITOR
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              padding: "40px 0",
              paddingTop: 80,
            }}
          >
            <div style={{ position: "relative", width: 64, height: 64 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "var(--accent)",
                  animation: "spin 1s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 8,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "var(--accent)",
                  animation: "spin 1.5s linear infinite reverse",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 16,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "var(--accent)",
                  animation: "spin 2s linear infinite",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 18,
                fontWeight: 500,
                color: "var(--text-dim-2)",
                letterSpacing: 4,
                animation:
                  "fadeIn .4s ease, fade-pulse 2s ease-in-out infinite",
              }}
            >
              SCANNING NETWORK
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 14,
                color: "var(--text-dim)",
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              This can take a couple seconds to load
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--text-dim)",
          letterSpacing: 2,
          marginTop: 30,
          paddingBottom: 52,
        }}
      >
        PING MONITOR
      </h2>

      <div className="device-selector-grid">
        {online.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d.id)}
            className={`device-selector-btn ${selected === d.id ? "active" : ""}`}
          >
            {d.hostname.split(".")[0]}
          </button>
        ))}
      </div>

      {dev && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div style={{ display: "flex", gap: 40, marginBottom: 24 }}>
            <Stat
              label="CURRENT"
              value={dev.ping != null ? `${dev.ping}ms` : "—"}
              ok={dev.ping != null ? dev.ping < 20 : undefined}
            />
            <Stat
              label="AVG"
              value={
                data.filter((p) => p.ping != null).length
                  ? `${Math.round(
                      data
                        .filter((p) => p.ping != null)
                        .reduce((a, b) => a + b.ping, 0) /
                        data.filter((p) => p.ping != null).length,
                    )}ms`
                  : "—"
              }
            />
            <Stat label="HOST" value={dev.hostname} mono />
            <Stat label="IP" value={dev.ip} mono />
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis
                dataKey="t"
                interval="preserveStartEnd"
                minTickGap={60}
                tick={{
                  fill: "#4d6080",
                  fontSize: 10,
                  fontFamily: "var(--mono)",
                }}
              />
              <YAxis
                tick={{
                  fill: "#4d6080",
                  fontSize: 10,
                  fontFamily: "var(--mono)",
                }}
                unit="ms"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                }}
              />
              <Line
                type="monotone"
                dataKey="ping"
                stroke="#00e5ff"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, ok, mono }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          color: "var(--text-dim)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: mono ? "var(--mono)" : "var(--sans)",
          fontSize: mono ? 13 : 22,
          fontWeight: 600,
          color:
            ok === true
              ? "var(--green)"
              : ok === false
                ? "var(--red)"
                : "var(--text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
