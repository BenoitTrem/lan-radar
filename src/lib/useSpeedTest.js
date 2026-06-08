// src/lib/useSpeedTest.js
"use client";
import { useState, useCallback } from "react";

export function useSpeedTest() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const run = useCallback(async () => {
    setRunning(true);
    setResult(null);

    if (window.electronAPI?.runSpeedTest) {
      const res = await window.electronAPI.runSpeedTest();

      if (res.error) {
        console.error("Speed test failed:", res.error);
        setRunning(false);
        return;
      }

      const r = {
        download: +((res.download.bandwidth * 8) / 1e6).toFixed(1),
        upload: +((res.upload.bandwidth * 8) / 1e6).toFixed(1),
        ping: +res.ping.latency.toFixed(1),
        ts: Date.now(),
      };
      setResult(r);
      setHistory((h) => [r, ...h].slice(0, 20));
    } else {
      // Browser mock
      await new Promise((r) => setTimeout(r, 3000));
      const r = {
        download: +(Math.random() * 200 + 50).toFixed(1),
        upload: +(Math.random() * 50 + 10).toFixed(1),
        ping: +(Math.random() * 20 + 5).toFixed(1),
        ts: Date.now(),
      };
      setResult(r);
      setHistory((h) => [r, ...h].slice(0, 20));
    }

    setRunning(false);
  }, []);

  return { running, result, history, run };
}
