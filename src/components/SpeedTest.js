"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LOADING_MESSAGES = [
  "Establishing server connection…",
  "Measuring network latency…",
  "Benchmarking download speed…",
  "Benchmarking upload speed…",
  "Calculating results…",
];

function SpeedTestSpinner() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "40px 0",
      }}
    >
      {/* Spinner rings */}
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

      {/* Rotating message */}
      <div
        key={msgIndex}
        style={{
          fontFamily: "var(--mono)",
          fontSize: 14,
          color: "var(--text-dim)",
          letterSpacing: 1,
          animation: "fadeIn .4s ease",
        }}
      >
        {LOADING_MESSAGES[msgIndex]}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
export default function SpeedTest({ running, result, history, run }) {
  const chartData = history
    .map((h, i) => ({
      name: `#${history.length - i}`,
      download: +h.download.toFixed(1),
      upload: +h.upload.toFixed(1),
    }))
    .reverse();

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--text-dim)",
          letterSpacing: 2,
          marginBottom: 20,
          marginTop: 30,
          paddingBottom: 52,
        }}
      >
        SPEED TEST
      </h2>

      {/* Centered run button */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          marginBottom: 40,
        }}
      >
        <button
          onClick={run}
          disabled={running}
          className="run-test-btn"
          style={{
            cursor: running ? "not-allowed" : "pointer",
            opacity: running ? 0.8 : 1,
          }}
        >
          {running ? "TESTING…" : "RUN TEST"}
        </button>

        {/* Stats below button */}
        {!running && result && (
          <div style={{ display: "flex", gap: 48 }}>
            <BigStat
              label="DOWNLOAD"
              value={result.download.toFixed(1)}
              unit="Mbps"
              color="var(--accent)"
            />
            <BigStat
              label="UPLOAD"
              value={result.upload.toFixed(1)}
              unit="Mbps"
              color="var(--green)"
            />
            <BigStat
              label="PING"
              value={result.ping.toFixed(1)}
              unit="ms"
              color="var(--yellow)"
            />
          </div>
        )}
      </div>

      {/* Loading spinner */}
      {running && <SpeedTestSpinner />}

      {/* History chart */}
      {!running && history.length > 1 && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--text-dim)",
              marginBottom: 16,
            }}
          >
            HISTORY (Mbps)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <XAxis
                dataKey="name"
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
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                }}
              />
              <Bar
                dataKey="download"
                fill="#00e5ff"
                radius={[3, 3, 0, 0]}
                name="Download"
              />
              <Bar
                dataKey="upload"
                fill="#22d3a0"
                radius={[3, 3, 0, 0]}
                name="Upload"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          display: "grid",
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--text-dim)",
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          GUIDE
        </div>

        <LegendItem color="var(--accent)" label="DOWNLOAD">
          How fast your connection receives data. Higher speeds let more people
          stream video simultaneously at better quality.
        </LegendItem>

        <LegendItem color="var(--green)" label="UPLOAD">
          How fast your connection sends data. Critical for video calls, online
          gaming, and sharing large files.
        </LegendItem>

        <LegendItem color="var(--yellow)" label="PING">
          Round-trip time to a server and back. Above 50ms causes noticeable lag
          in gaming, VoIP, and video conferencing.
        </LegendItem>

        <LegendItem color="var(--text-dim)" label="JITTER">
          Variation in latency over time. A stable connection stays under 5ms —
          high jitter makes real-time audio and video choppy.
        </LegendItem>

        <LegendItem color="var(--red)" label="BUFFERBLOAT">
          When a device on your network uploads at full speed, it can saturate
          the router and spike latency for everyone else. This can be mitigated
          by limiting upload speed in your router settings or upgrading to a
          router that handles traffic shaping.
        </LegendItem>
      </div>
    </div>
  );
}
function BigStat({ label, value, unit, color }) {
  return (
    <div style={{ textAlign: "center" }}>
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
      <div style={{ fontSize: 32, fontWeight: 700, color }}>
        {value}{" "}
        <span
          style={{ fontSize: 14, fontWeight: 400, color: "var(--text-dim)" }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}
function LegendItem({ color, label, children }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div
        style={{ width: 3, borderRadius: 2, background: color, flexShrink: 0 }}
      />
      <div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color,
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
