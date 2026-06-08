// src/app/page.js
"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DeviceList from "@/components/DeviceList";
import PingMonitor from "@/components/PingMonitor";
import SpeedTest from "@/components/SpeedTest";
import AppDiscovery from "@/components/AppDiscovery";
import About from "@/components/About";
import Notifications from "@/components/Notifications";
import { useDevices } from "@/lib/useDevices";
import { useSpeedTest } from "@/lib/useSpeedTest";

const VIEWS = ["devices", "ping", "speed", "apps", "about"];

export default function Home() {
  const [view, setView] = useState("devices");
  const deviceStore = useDevices();
  const speedStore = useSpeedTest();
  const {
    devices,
    notifications,
    scanning,
    startScan,
    permissionError,
    pingsReady,
  } = deviceStore;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        view={view}
        setView={setView}
        devices={devices}
        scanning={scanning}
        onScan={startScan}
      />

      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "28px 32px",
          animation: "fade-in .35s ease",
        }}
      >
        {view === "devices" && (
          <DeviceList
            devices={devices}
            permissionError={permissionError}
            scanning={scanning}
          />
        )}
        {view === "ping" && (
          <PingMonitor
            devices={devices}
            scanning={scanning}
            pingsReady={pingsReady}
          />
        )}
        {view === "speed" && <SpeedTest {...speedStore} />}
        {view === "apps" && <AppDiscovery devices={devices} />}
        {view === "about" && <About />}
      </main>

      <Notifications items={notifications} />
    </div>
  );
}
