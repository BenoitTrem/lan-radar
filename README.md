# LAN Radar 📡

A local network monitoring desktop app built with **Next.js 14 + Electron**.

## Features

| Feature | Status | Notes |
|---|---|---|
| Live device list | ✅ | Vendor detection (Apple, Samsung, etc.) |
| Join/leave notifications | ✅ | Toast overlay, auto-dismiss |
| Network map | ✅ | Radial canvas visualization |
| Ping monitor | ✅ | Live chart via Recharts |
| Device uptime tracking | ✅ | Per-device since first seen |
| Speed tests | ✅ | Uses `speedtest-net` in Electron |
| Vendor detection | ✅ | OUI MAC prefix lookup |
| LAN game discovery | ✅ | mDNS/Bonjour via `bonjour-service` |

## Stack

- **Next.js 14** — UI with App Router
- **Electron 28** — native desktop shell + IPC bridge
- **Recharts** — charts (ping history, speed test history)
- **Canvas API** — network map
- **node-arp / local-devices** — LAN scanning (Electron only)
- **ping** — ICMP ping (Electron only)
- **speedtest-net** — speed tests (Electron only)
- **bonjour-service** — mDNS game/service discovery (Electron only)

## Getting Started

```bash
npm install
npm run dev          # runs Next.js + Electron concurrently
```

## Production Build

```bash
npm run electron:build   # outputs to /dist
```

## Architecture

```
lan-radar/
├── electron/
│   ├── main.js        # Electron main process + IPC handlers
│   └── preload.js     # contextBridge — safe API surface for renderer
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── layout.js
│   │   ├── page.js    # Dashboard shell
│   │   └── globals.css
│   ├── components/    # UI panels (DeviceList, NetworkMap, PingMonitor…)
│   └── lib/           # Hooks (useDevices, useSpeedTest)
├── next.config.js
└── package.json
```

## IPC Flow

```
Next.js renderer (page.js / hooks)
        │  window.electronAPI.xxx()
        ▼
electron/preload.js  (contextBridge)
        │  ipcRenderer.invoke / on
        ▼
electron/main.js  (ipcMain.handle)
        │
        ▼
  native modules (ping, local-devices, speedtest-net, bonjour)
```

## Adding Real Scanning

Replace mock data in `src/lib/useDevices.js` with IPC calls:

```js
// In useDevices.js useEffect:
const devices = await window.electronAPI.startScan();
setDevices(devices.map(d => ({ ...d, vendor: detectVendor(d.mac) })));
```

And in `electron/main.js`:

```js
ipcMain.handle('scan:start', async () => {
  const localDevices = require('local-devices');
  return await localDevices();
});
```
