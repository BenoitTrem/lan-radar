"use client";
import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, FolderOpen } from "lucide-react";

const ALPHABET = [
  "ALL",
  "#",
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
];

export default function AppDiscovery() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sizeSort, setSizeSort] = useState(null); // null | "asc" | "desc"
  const [revealing, setRevealing] = useState(null);

  useEffect(() => {
    window.electronAPI.appsList().then((data) => {
      setApps(data);
      setLoading(false);
    });
  }, []);

  const filtered = apps
    .filter((a) => {
      const name = a.name.toLowerCase();
      const matchSearch = name.includes(search.toLowerCase());
      const matchFilter =
        filter === "ALL"
          ? true
          : filter === "#"
            ? /^[^a-z]/i.test(a.name)
            : a.name.toUpperCase().startsWith(filter);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (!sizeSort) return 0;
      const sa = a.size ?? -1;
      const sb = b.size ?? -1;
      return sizeSort === "asc" ? sa - sb : sb - sa;
    });
  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--text-dim)",
          letterSpacing: 2,
          marginTop: 30,
          paddingBottom: 32,
        }}
      >
        INSTALLED APPS — {apps.length} TOTAL
      </h2>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search apps…"
        className="search-input"
      />

      {/* Alphabet filter */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 24 }}
      >
        <button
          onClick={() => setSizeSort((s) => (s === "asc" ? null : "asc"))}
          className={`filter-btn ${sizeSort === "asc" ? "active" : ""}`}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowUp size={11} /> SIZE
          </span>
        </button>
        <button
          onClick={() => setSizeSort((s) => (s === "desc" ? null : "desc"))}
          className={`filter-btn ${sizeSort === "desc" ? "active" : ""}`}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowDown size={11} /> SIZE
          </span>
        </button>

        {ALPHABET.map((l) => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`filter-btn ${filter === l ? "active" : ""}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
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
              animation: "fade-pulse 2s ease-in-out infinite",
            }}
          >
            LOADING APPS...
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {filtered.length === 0 && (
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--text-dim)",
                padding: "40px 0",
                textAlign: "center",
              }}
            >
              NO APPS FOUND
            </div>
          )}
          {filtered.map((a, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 180px 100px 110px 36px",
                alignItems: "center",
                gap: 16,
                padding: "12px 20px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {a.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--text-dim)",
                }}
              >
                {a.publisher}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color:
                    a.size > 1024
                      ? "var(--red)"
                      : a.size > 100
                        ? "var(--yellow)"
                        : "var(--green)",
                }}
              >
                {a.size !== null
                  ? a.size >= 1024
                    ? `${(a.size / 1024).toFixed(1)} GB`
                    : `${a.size} MB`
                  : "—"}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--text-dim)",
                  textAlign: "right",
                }}
              >
                {a.installDate
                  ? `${a.installDate.slice(0, 4)}-${a.installDate.slice(4, 6)}-${a.installDate.slice(6, 8)}`
                  : "—"}
              </div>
              <button
                onClick={async () => {
                  setRevealing(i);
                  await window.electronAPI.appsReveal(a.name);
                  setRevealing(null);
                }}
                className="filter-btn"
                title="Open in File Explorer"
                style={{
                  padding: "4px 6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {revealing === i ? (
                  <div
                    style={{
                      width: 13,
                      height: 13,
                      border: "2px solid transparent",
                      borderTopColor: "var(--accent)",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                ) : (
                  <FolderOpen size={13} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
