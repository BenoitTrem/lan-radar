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
import SplashScreen from "@/components/SplashScreen";
import { useDevices } from "@/lib/useDevices";
import { useSpeedTest } from "@/lib/useSpeedTest";

export default function Home() {
  const [view, setView] = useState("devices");
  const [ready, setReady] = useState(false); // false = splash showing
  const deviceStore = useDevices();
  const speedStore = useSpeedTest();
  const {
    devices,
    notifications,
    scanning,
    startScan,
    permissionError,
    pingsReady,
    testJoin,
    testLeave,
  } = deviceStore;

  return (
    <>
      {!ready && <SplashScreen onDone={() => setReady(true)} />}

      <div
        key={ready ? "app" : "hidden"} // re-mounts to retrigger animation
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          opacity: ready ? 1 : 0,
          animation: ready ? "fade-in 0.5s ease forwards" : "none",
        }}
      >
        <Sidebar
          view={view}
          setView={setView}
          devices={devices}
          scanning={scanning}
          onScan={startScan}
        />
        <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
          {view === "devices" && (
            <DeviceList
              devices={devices}
              permissionError={permissionError}
              scanning={scanning}
              onTestJoin={testJoin}
              onTestLeave={testLeave}
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
    </>
  );
}
