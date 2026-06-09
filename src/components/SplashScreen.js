// components/SplashScreen.jsx
import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2700);
    const doneTimer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3000);

    const dotsTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      clearInterval(dotsTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`splash-screen${fading ? " fading" : ""}`}>
      <img src="./icon.ico" className="splash-icon" />
      <h1 className="splash-title">Lan Radar</h1>

      <div
        style={{ position: "relative", width: 120, height: 120, marginTop: 12 }}
      >
        {/* static rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: i * 18,
              borderRadius: "50%",
              border: "1px solid var(--accent)",
              opacity: 0.12 + i * 0.08,
            }}
          />
        ))}

        {/* center dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 8px var(--accent)",
          }}
        />

        {/* sonar sweep — conic gradient only, no tip dot */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            animation: "spin 2s linear infinite",
            background:
              "conic-gradient(from 0deg, transparent 70%, rgba(0,229,255,0.18) 100%)",
          }}
        />

        {/* blip dots */}
        {[
          { angle: 40, r: 30 },
          { angle: 130, r: 42 },
          { angle: 220, r: 22 },
          { angle: 300, r: 38 },
        ].map(({ angle, r }, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "var(--accent)",
                top: `calc(50% + ${Math.sin(rad) * r}px - 2px)`,
                left: `calc(50% + ${Math.cos(rad) * r}px - 2px)`,
                boxShadow: "0 0 5px var(--accent)",
                opacity: 0.7,
                animation: `fade-pulse ${1.5 + i * 0.4}s ease-in-out infinite`,
              }}
            />
          );
        })}
      </div>

      {/* status line */}
      <div
        style={{
          marginTop: 20,
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: 3,
          color: "var(--text-dim)",
          textTransform: "uppercase",
          animation: "fade-pulse 2s ease-in-out infinite",
          minWidth: 180,
          textAlign: "center",
        }}
      >
        Initializing{dots}
      </div>
    </div>
  );
}
