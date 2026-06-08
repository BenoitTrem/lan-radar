"use client";
import { Github, ExternalLink } from "lucide-react";

export default function About() {
  const openLink = (url) => window.electronAPI.openExternal(url);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
      <h2
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--text-dim)",
          letterSpacing: 2,
          marginTop: 30,
          paddingBottom: 102,
        }}
      >
        ABOUT
      </h2>

      {/* App identity */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 32,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 24,
            color: "var(--accent)",
            letterSpacing: 3,
            marginBottom: 8,
          }}
        >
          LAN RADAR
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--text-dim)",
            letterSpacing: 1,
            marginBottom: 24,
          }}
        >
          VERSION 1.0.0
        </div>
        <div
          style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.8 }}
        >
          LAN Radar is a local network monitoring tool built with Electron and
          Next.js. It lets you discover devices, monitor ping, run speed tests,
          and browse installed apps — all from one place.
        </div>
      </div>

      {/* Links */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 16,
          display: "grid",
          gap: 12,
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
          LINKS
        </div>
        <button
          onClick={() => openLink("https://github.com/YOUR_USERNAME/YOUR_REPO")}
          className="filter-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            justifyContent: "space-between",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Github size={14} /> Source Code
          </span>
          <ExternalLink size={11} />
        </button>
      </div>

      {/* Legal */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--text-dim)",
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          LEGAL
        </div>
        <div
          style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.8 }}
        >
          © 2026 Benoit Tremblay. All rights reserved.
          <br />
          <br />
          This software is provided as-is, without warranty of any kind.
          Redistribution or commercial use without explicit permission is
          prohibited.
        </div>
      </div>
    </div>
  );
}
