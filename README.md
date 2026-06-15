# LAN Radar

A local network monitoring desktop application built with Next.js and Electron.

[![Download](https://img.shields.io/badge/Download-LAN%20Radar%20v1.0.0-blue?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/BenoitTrem/lan-radar/releases/download/V1.0.0/LAN.Radar.Setup.1.0.0.exe)

## Features
- Live device discovery with vendor detection (Apple, Samsung, Google, and more)
- Join and leave notifications with auto-dismissing toast overlay
- Ping monitor with live chart
- Device uptime tracking per device since first seen
- Speed test integration via Ookla Speedtest CLI
- MAC address vendor lookup via OUI prefix table
- Installed application browser with size, publisher, and install date
- mDNS device name resolution via Bonjour

## Stack
- **Next.js 14** — UI with App Router
- **Electron 28** — native desktop shell and IPC bridge
- **Recharts** — ping history and speed test history charts
- **bonjour-service** — mDNS device name resolution
- **ping** — ICMP ping (Electron main process only)

## Requirements

### Ookla Speedtest CLI (required for speed tests)
The speed test feature requires the Ookla Speedtest CLI binary to be placed in the `resources/` folder of the project before building.

1. Download the Windows CLI from: https://www.speedtest.net/apps/cli
2. Extract the archive
3. Place `speedtest.exe` into the `resources/` folder at the project root:
```
lan-radar/
└── resources/
    └── speedtest.exe
```
The application will automatically detect it at runtime. Without this file, the speed test feature will not function.

### Bonjour (optional, recommended)
Installing Apple Bonjour improves device name resolution on Windows, particularly for Google Home, Apple, and other mDNS-capable devices.

Download: https://support.apple.com/kb/DL999

## Getting Started

```bash
npm install
npm run dev
```

This runs Next.js and Electron concurrently.

## Production Build

```bash
npm run electron:build
```

Output is placed in the `/dist` directory.

## Project Structure

```
lan-radar/
├── electron/
│   ├── main.js          # Electron main process and IPC handlers
│   └── preload.js       # contextBridge API surface for the renderer
├── resources/
│   └── speedtest.exe    # Ookla Speedtest CLI (not included, see Requirements)
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js      # Main dashboard shell
│   │   └── globals.css
│   ├── components/      # UI panels (DeviceList, PingMonitor, SpeedTest, AppDiscovery)
│   └── lib/             # Custom hooks (useDevices, useSpeedTest)
└── package.json
```

## IPC Architecture

```
Next.js renderer
      |  window.electronAPI.xxx()
      v
electron/preload.js   (contextBridge)
      |  ipcRenderer.invoke / on
      v
electron/main.js      (ipcMain.handle)
      |
      v
native modules (ping, bonjour-service, Speedtest CLI, Windows Registry)
```

## License

Copyright 2026 Benoit Tremblay. All rights reserved.

This project is open source. You are welcome to explore the code, fork the repository, and build upon it for your own projects.
