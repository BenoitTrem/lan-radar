// src/app/layout.js
import "./globals.css";

export const metadata = { title: "LAN Radar", description: "Local network monitor" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
