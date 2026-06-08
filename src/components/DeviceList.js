// src/components/DeviceList.js
"use client";

import * as simpleIcons from "simple-icons";
import { useState, useEffect } from "react";
import { ShieldAlert, HelpCircle, Camera, ShoppingBag } from "lucide-react";

let bonjourDismissed = false;

function SimpleIcon({ icon, size = 16 }) {
  if (!icon) return <HelpCircle size={size} />;

  // lucide icon type
  if (icon.type === "lucide") {
    const LucideIcon = icon.icon;
    return <LucideIcon size={size} />;
  }

  // simple-icons type
  return (
    <svg
      role="img"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d={icon.path} />
    </svg>
  );
}

const VENDOR_ICON = {
  Apple: simpleIcons.siApple,
  Samsung: simpleIcons.siSamsung,
  "Raspberry Pi": simpleIcons.siRaspberrypi,
  "TP-Link": simpleIcons.siTplink,
  Google: simpleIcons.siGoogle,
  Netgear: simpleIcons.siNetgear,
};

function getFallbackIcon(vendor = "") {
  const v = vendor.toLowerCase();

  if (v.includes("amazon")) return { type: "lucide", icon: ShoppingBag };
  if (v.includes("canon")) return { type: "lucide", icon: Camera };

  return { type: "lucide", icon: HelpCircle };
}

function getVendorIcon(vendor = "") {
  const v = vendor.toLowerCase();

  if (v.includes("apple")) return VENDOR_ICON.Apple;
  if (v.includes("samsung")) return VENDOR_ICON.Samsung;
  if (v.includes("microsoft")) return simpleIcons.siMicrosoft;
  if (v.includes("raspberry")) return VENDOR_ICON["Raspberry Pi"];
  if (v.includes("tp-link") || v.includes("tp link"))
    return VENDOR_ICON["TP-Link"];
  if (v.includes("google")) return VENDOR_ICON.Google;
  if (v.includes("netgear")) return VENDOR_ICON.Netgear;

  return getFallbackIcon(vendor);
}

function uptimeStr(joinedAt) {
  const s = Math.floor((Date.now() - joinedAt) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function DeviceList({ devices, permissionError, scanning }) {
  const [bonjourStatus, setBonjourStatus] = useState(null);
  const [dismissed, setDismissed] = useState(bonjourDismissed);

  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.bonjourCheck().then(setBonjourStatus);
  }, []);

  const installBonjour = async () => {
    await window.electronAPI.bonjourInstall();
    setBonjourStatus({ pending: true });
  };
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
        DEVICE LIST — {devices.length} TOTAL
      </h2>

      {scanning && devices.length === 0 ? (
        <div
          style={{
            maxWidth: 1200,
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            gap: 20,
          }}
        >
          {/* Spinner */}
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
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {bonjourStatus &&
            !bonjourStatus.installed &&
            !permissionError &&
            !dismissed && (
              <div
                style={{
                  maxWidth: 1200,
                  width: "100%",
                  marginLeft: "auto",
                  marginRight: "auto",
                  paddingBottom: 38,
                }}
              >
                <div
                  style={{
                    padding: "12px 20px",
                    background: "var(--surface)",
                    border: "1px solid var(--yellow)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "var(--yellow)",
                      letterSpacing: 1,
                      fontWeight: 500,
                    }}
                  >
                    INSTALL BONJOUR (APPLE'S NETWORK SERVICE) FOR BETTER DEVICE
                    NAMES (GOOGLE HOME, APPLE DEVICES)
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={installBonjour} className="bonjour-btn">
                      DOWNLOAD
                    </button>
                    <button
                      onClick={() => {
                        bonjourDismissed = true;
                        setDismissed(true);
                      }}
                      className="bonjour-btn"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          {permissionError && (
            <div
              style={{
                maxWidth: 1200,
                width: "100%",
                marginLeft: "auto",
                marginRight: "auto",
                paddingBottom: 24,
                marginTop: 95,
              }}
            >
              <div
                style={{
                  padding: "12px 20px",
                  background: "var(--surface)",
                  border: "1px solid var(--red)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--red)",
                    letterSpacing: 1,
                    fontWeight: 500,
                  }}
                >
                  <ShieldAlert size={16} />
                  NETWORK ACCESS BLOCKED — NO DEVICES CAN BE SCANNED
                </span>
                <button
                  onClick={() => window.electronAPI.openPermissionSettings()}
                  className="permission-btn"
                >
                  OPEN NETWORK SETTINGS
                </button>
              </div>
            </div>
          )}
          {devices.length > 0 && (
            <div
              style={{
                maxWidth: 1200,
                width: "100%",
                marginLeft: "auto",
                marginRight: "auto",
                display: "grid",
                gridTemplateColumns: "32px 1fr 200px 200px 10px 10px",
                gap: 16,
                padding: "8px 20px",
                marginBottom: 4,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div />
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-dim)",
                  letterSpacing: 2,
                }}
              >
                HOST
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-dim)",
                  letterSpacing: 2,
                }}
              >
                VENDOR
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-dim)",
                  letterSpacing: 2,
                }}
              >
                PING
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-dim)",
                  letterSpacing: 2,
                  textAlign: "right",
                  gridColumn: "5 / 7",
                }}
              >
                UPTIME
              </div>
            </div>
          )}
          {devices.map((d) => (
            <div key={d.id} className="device-card">
              {/* Status dot */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: d.online ? "var(--green)" : "var(--text-dim)",
                  boxShadow: d.online ? "0 0 8px var(--green)" : "none",
                  animation: d.online ? "pulse-dot 2s infinite" : "none",
                }}
              />

              {/* Host info */}
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {d.hostname}
                  {d.nameUnresolved && (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 9,
                        letterSpacing: 1,
                        color: "var(--text-dim)",
                        border: "1px solid var(--text-dim)",
                        borderRadius: 4,
                        padding: "1px 6px",
                        opacity: 0.6,
                      }}
                    >
                      NAME UNKNOWN
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    marginTop: 2,
                  }}
                >
                  {d.ip} · {d.mac}
                </div>
              </div>

              {/* Vendor */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--text-dim)",
                }}
              >
                <span style={{ color: "var(--accent)", flexShrink: 0 }}>
                  <SimpleIcon icon={getVendorIcon(d.vendor)} size={16} />
                </span>
                {d.vendor}
              </div>

              {/* Ping */}
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  color: !d.online
                    ? "var(--text-dim)"
                    : d.ping < 10
                      ? "var(--green)"
                      : d.ping < 50
                        ? "var(--yellow)"
                        : "var(--red)",
                }}
              >
                {d.online && d.ping != null ? `${d.ping}ms` : "—"}
              </div>

              {/* Uptime */}
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--text-dim)",
                  textAlign: "right",
                }}
              >
                {d.online ? uptimeStr(d.joinedAt) : "offline"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
