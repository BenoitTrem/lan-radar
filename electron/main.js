const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { execSync } = require("child_process");
const dns = require("dns").promises;
const https = require("https");
const dgram = require("dgram");
const mdns = require("bonjour-service");

const isDev = process.env.NODE_ENV !== "production";
let mainWindow;

const OUI = {
  "000000": "Xerox",
  "0001C7": "Cisco",
  "000C29": "VMware",
  "000D3A": "Microsoft",
  "00505A": "IBM",

  "000A27": "Apple",
  "000A95": "Apple",
  "0010FA": "Apple",
  "001124": "Apple",
  "001451": "Apple",
  "001636": "Apple",
  "0016CB": "Apple",
  "001731": "Apple",
  "001B63": "Apple",
  "001CF0": "Apple",
  "001E52": "Apple",
  "001E63": "Apple",
  "002241": "Apple",
  "002332": "Apple",
  "002500": "Apple",
  "0026B9": "Apple",
  "0026BB": "Apple",
  "003065": "Apple",
  "34159E": "Apple",
  "3C0754": "Apple",
  "70CD60": "Apple",
  A85B78: "Apple",
  D0E140: "Apple",
  F0DBF8: "Apple",

  "000000": "Google",
  "1C1AC0": "Google",
  "3497F6": "Google",
  "48D6D5": "Google",
  "54607E": "Google",
  "6C5AB5": "Google",
  "7C61EB": "Google",
  "94EB2C": "Google",
  A47733: "Google",
  F88FCA: "Google",

  "002339": "Samsung",
  "0024E9": "Samsung",
  "002454": "Samsung",
  "0026E2": "Samsung",
  "286C07": "Samsung",
  "38AA3C": "Samsung",
  "5C3C27": "Samsung",
  "8C71F8": "Samsung",
  CCF9E8: "Samsung",

  "0C47C9": "Amazon",
  "10AE60": "Amazon",
  "34D270": "Amazon",
  "40B4CD": "Amazon",
  "44650D": "Amazon",
  "68370E": "Amazon",
  "74C246": "Amazon",
  "84D6D0": "Amazon",
  A002DC: "Amazon",
  B47C9C: "Amazon",
  F0272D: "Amazon",
  FC65DE: "Amazon",

  "001B2F": "Netgear",
  "001E2A": "Netgear",
  "002275": "Netgear",
  "0026F2": "Netgear",
  "083F76": "Netgear",
  "10DA43": "Netgear",
  "1CF5EE": "Netgear",
  "20E52A": "Netgear",
  "28C68E": "Netgear",
  "2CB05D": "Netgear",
  "44944E": "Netgear",
  "6CB0CE": "Netgear",
  "9C3DCF": "Netgear",
  A040A0: "Netgear",
  C03F0E: "Netgear",
  E091F5: "Netgear",

  "0014D1": "TP-Link",
  "001999": "TP-Link",
  "1062EB": "TP-Link",
  186872: "TP-Link",
  "1CF6AC": "TP-Link",
  "50C7BF": "TP-Link",
  "6466B3": "TP-Link",
  "78A3E4": "TP-Link",
  "8CFAB1": "TP-Link",
  "94D9B3": "TP-Link",
  B0487A: "TP-Link",
  C46E1F: "TP-Link",
  E8DE27: "TP-Link",
  F4F26D: "TP-Link",

  B827EB: "Raspberry Pi",
  DCA632: "Raspberry Pi",
  E45F01: "Raspberry Pi",

  "000085": "Canon",
  "00000C": "Canon",
  "00001E": "Canon",
  "000060": "Canon",
  "0000D0": "Canon",
  "00001C": "Canon",
  "3C1A57": "Canon",
  "415EA3": "Canon",
  "8C170A": "Canon",
  ACB571: "Canon",
  E4B31B: "Canon",

  "002275": "Arcadyan",
  "0090D0": "Arcadyan",
  283537: "Arcadyan",
  "3085A9": "Arcadyan",
  "4C09D4": "Arcadyan",
  "74B57E": "Arcadyan",
  "84E235": "Arcadyan",
  "9C97F6": "Arcadyan",

  "080027": "VirtualBox",
  "0050F2": "Microsoft",
  "00163E": "Xen",
  525400: "QEMU",
};

function lookupVendor(mac) {
  const prefix = mac.replace(/:/g, "").slice(0, 6).toUpperCase();
  if (OUI[prefix]) return Promise.resolve(OUI[prefix]);

  return new Promise((resolve) => {
    const req = https.get(
      `https://api.maclookup.app/v2/macs/${prefix}`,
      { timeout: 3000 },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode === 429) {
            resolve("Unknown");
            return;
          }
          try {
            resolve(JSON.parse(data).company || "Unknown");
          } catch {
            resolve("Unknown");
          }
        });
      },
    );
    req.on("error", () => resolve("Unknown"));
    req.on("timeout", () => {
      req.destroy();
      resolve("Unknown");
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "../build/icon.ico"),
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#080c14",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.maximize();
  mainWindow.setMenuBarVisibility(false);
  const url = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`;
  mainWindow.loadURL(url);
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on(
  "activate",
  () => BrowserWindow.getAllWindows().length === 0 && createWindow(),
);

async function getMdnsNames() {
  const hasBonjour = await checkBonjourInstalled();
  console.log("[mdns] Bonjour available:", hasBonjour);
  if (hasBonjour) {
    return getMdnsNamesBonjour();
  } else {
    return getMdnsNamesWindows();
  }
}

function checkBonjourInstalled() {
  if (process.platform !== "win32") return Promise.resolve(true);
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    exec('sc query "Bonjour Service"', (err, stdout) => {
      resolve(!err && stdout.includes("RUNNING"));
    });
  });
}

async function getMdnsNamesBonjour() {
  const triggerPermission = () =>
    new Promise((resolve) => {
      const sock = dgram.createSocket("udp4");
      sock.send(Buffer.from(""), 5353, "224.0.0.251", () => {
        sock.close();
        resolve();
      });
    });
  await triggerPermission();
  return new Promise((resolve) => {
    const bonjour = new mdns.Bonjour();
    const names = {};
    const store = (service) => {
      for (const addr of service.addresses || []) {
        if (addr && !names[addr])
          names[addr] =
            service.name || service.host?.replace(/\.local\.?$/, "");
      }
    };
    bonjour.find({}, store);
    bonjour.find({ type: "googlecast" }, store);
    bonjour.find({ type: "googlerpc" }, store);
    bonjour.find({ type: "amzn-wplay" }, store);
    bonjour.find({ type: "hap" }, store);
    bonjour.find({ type: "ipp" }, store);
    bonjour.find({ type: "printer" }, store);
    bonjour.find({ type: "pdl-datastream" }, store);
    setTimeout(() => {
      bonjour.destroy();
      console.log("mDNS names (bonjour):", names);
      resolve(names);
    }, 4000);
  });
}
function checkBonjourInstalled() {
  if (process.platform !== "win32") return Promise.resolve(true);
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    exec('sc query "Bonjour Service"', (err, stdout) => {
      resolve(!err && stdout.includes("RUNNING"));
    });
  });
}

async function getMdnsNamesWindows() {
  const names = {};

  await new Promise((resolve) => {
    const MDNS_ADDR = "224.0.0.251";
    const MDNS_PORT = 5353;

    function buildMdnsQuery(service) {
      const parts = service.split(".");
      let buf = Buffer.alloc(512);
      let offset = 0;

      buf.writeUInt16BE(0x0000, offset);
      offset += 2;
      buf.writeUInt16BE(0x0000, offset);
      offset += 2;
      buf.writeUInt16BE(0x0001, offset);
      offset += 2;
      buf.writeUInt16BE(0x0000, offset);
      offset += 2;
      buf.writeUInt16BE(0x0000, offset);
      offset += 2;
      buf.writeUInt16BE(0x0000, offset);
      offset += 2;

      for (const part of parts) {
        buf[offset++] = part.length;
        buf.write(part, offset, "ascii");
        offset += part.length;
      }
      buf[offset++] = 0x00;

      buf.writeUInt16BE(0x000c, offset);
      offset += 2;
      buf.writeUInt16BE(0x8001, offset);
      offset += 2;

      return buf.slice(0, offset);
    }

    function parseMdnsResponse(msg) {
      try {
        let offset = 0;
        const qdCount = msg.readUInt16BE(4);
        const anCount = msg.readUInt16BE(6);
        offset = 12;

        for (let i = 0; i < qdCount; i++) {
          while (offset < msg.length && msg[offset] !== 0) {
            if ((msg[offset] & 0xc0) === 0xc0) {
              offset += 2;
              break;
            }
            offset += msg[offset] + 1;
          }
          if (msg[offset] === 0) offset++;
          offset += 4;
        }

        const results = { ptrs: [], addresses: {} };
        for (let i = 0; i < anCount; i++) {
          while (offset < msg.length) {
            if ((msg[offset] & 0xc0) === 0xc0) {
              offset += 2;
              break;
            }
            if (msg[offset] === 0) {
              offset++;
              break;
            }
            offset += msg[offset] + 1;
          }
          if (offset + 10 > msg.length) break;
          const type = msg.readUInt16BE(offset);
          offset += 2;
          offset += 2;
          offset += 4;
          const rdLen = msg.readUInt16BE(offset);
          offset += 2;
          const rdStart = offset;

          if (type === 0x0c) {
            let nameOffset = offset;
            let name = "";
            let safety = 0;
            while (
              nameOffset < msg.length &&
              msg[nameOffset] !== 0 &&
              safety++ < 20
            ) {
              if ((msg[nameOffset] & 0xc0) === 0xc0) {
                nameOffset = msg.readUInt16BE(nameOffset) & 0x3fff;
                continue;
              }
              const len = msg[nameOffset++];
              name +=
                (name ? "." : "") +
                msg.slice(nameOffset, nameOffset + len).toString("ascii");
              nameOffset += len;
            }
            if (name) results.ptrs.push(name);
          } else if (type === 0x01 && rdLen === 4) {
            const ip = `${msg[offset]}.${msg[offset + 1]}.${msg[offset + 2]}.${msg[offset + 3]}`;
            results.addresses[ip] = true;
          }
          offset = rdStart + rdLen;
        }
        return results;
      } catch {
        return null;
      }
    }

    const sock = dgram.createSocket({ type: "udp4", reuseAddr: true });
    const services = [
      "_googlecast._tcp.local",
      "_googlerpc._tcp.local",
      "_matter._tcp.local",
      "_amzn-wplay._tcp.local",
      "_amzn-alexa._tcp.local",
      "_http._tcp.local",
      "_ipp._tcp.local",
      "_hap._tcp.local",
      "_lifx._udp.local",
      "_sleep-proxy._udp.local",
      "_device-info._tcp.local",
    ];

    sock.on("error", (e) => {
      console.log("[mdns-raw] socket error:", e.message);
      resolve();
    });

    sock.on("message", (msg, rinfo) => {
      const parsed = parseMdnsResponse(msg);
      if (!parsed) return;
      console.log(
        "[mdns-raw] response from",
        rinfo.address,
        "ptrs:",
        parsed.ptrs,
        "addrs:",
        Object.keys(parsed.addresses),
      );

      if (parsed.ptrs.length > 0) {
        const friendlyName = parsed.ptrs[0].split(".")[0];
        if (!names[rinfo.address]) {
          names[rinfo.address] = friendlyName;
          console.log(`[mdns-raw] PTR: ${rinfo.address} → ${friendlyName}`);
        }
        for (const ip of Object.keys(parsed.addresses)) {
          if (!names[ip]) {
            names[ip] = friendlyName;
            console.log(`[mdns-raw] A-rec: ${ip} → ${friendlyName}`);
          }
        }
      }
    });

    sock.bind(5353, () => {
      const { networkInterfaces } = require("os");
      const nets = networkInterfaces();
      let wifiIp = null;
      const VIRTUAL_PREFIXES = [
        "vmware",
        "vmnet",
        "virtualbox",
        "vbox",
        "loopback",
        "pseudo",
      ];

      for (const [ifaceName, addrs] of Object.entries(nets)) {
        const nameLower = ifaceName.toLowerCase();
        const isVirtual = VIRTUAL_PREFIXES.some((p) => nameLower.includes(p));
        if (isVirtual) continue;

        for (const addr of addrs) {
          if (addr.family === "IPv4" && !addr.internal) {
            wifiIp = addr.address;
            console.log(
              `[mdns-raw] selected interface: ${ifaceName} → ${addr.address}`,
            );
            break;
          }
        }
        if (wifiIp) break;
      }
      console.log("[mdns-raw] binding to interface:", wifiIp);

      sock.addMembership(MDNS_ADDR, wifiIp);
      sock.setMulticastInterface(wifiIp);
      sock.setMulticastTTL(255);

      for (const service of services) {
        const query = buildMdnsQuery(service);
        sock.send(query, 0, query.length, MDNS_PORT, MDNS_ADDR, (err) => {
          if (err) console.log("[mdns-raw] send error:", err.message);
        });
      }

      setTimeout(() => {
        try {
          sock.close();
        } catch {}
        console.log("[mdns-raw] final names:", names);
        resolve();
      }, 3000);
    });
  });

  return names;
}
async function getNetbiosNameWindows(ip) {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    exec(`nbtstat -A ${ip}`, { timeout: 5000 }, (err, stdout, stderr) => {
      console.log(`nbtstat ${ip} stdout:`, stdout?.slice(0, 200));
      console.log(`nbtstat ${ip} err:`, err?.message);
      if (err) return reject(err);
      const match =
        stdout.match(/^\s*(\S+)\s+<00>\s+UNIQUE/m) ||
        stdout.match(/^\s*(\S+)\s+<00>\s+Unique/m) ||
        stdout.match(/(\S+)\s+<00>/m);
      if (match?.[1]) resolve(match[1].trim());
      else reject(new Error("no name found"));
    });
  });
}

async function queryMdnsUnicast(ip) {
  return new Promise((resolve) => {
    const MDNS_PORT = 5353;
    const services = [
      "_googlecast._tcp.local",
      "_googlerpc._tcp.local",
      "_matter._tcp.local",
    ];

    function buildQuery(service) {
      const parts = service.split(".");
      let buf = Buffer.alloc(512);
      let offset = 0;
      buf.writeUInt16BE(0x0000, offset);
      offset += 2;
      buf.writeUInt16BE(0x0000, offset);
      offset += 2;
      buf.writeUInt16BE(0x0001, offset);
      offset += 2;
      buf.writeUInt16BE(0x0000, offset);
      offset += 2;
      buf.writeUInt16BE(0x0000, offset);
      offset += 2;
      buf.writeUInt16BE(0x0000, offset);
      offset += 2;
      for (const part of parts) {
        buf[offset++] = part.length;
        buf.write(part, offset, "ascii");
        offset += part.length;
      }
      buf[offset++] = 0x00;
      buf.writeUInt16BE(0x000c, offset);
      offset += 2;
      buf.writeUInt16BE(0x0001, offset);
      offset += 2;
      return buf.slice(0, offset);
    }

    const sock = dgram.createSocket("udp4");
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try {
          sock.close();
        } catch {}
        resolve(null);
      }
    }, 2000);

    sock.on("message", (msg) => {
      if (resolved) return;
      try {
        let offset = 12;
        const anCount = msg.readUInt16BE(6);
        const qdCount = msg.readUInt16BE(4);
        for (let i = 0; i < qdCount; i++) {
          while (offset < msg.length && msg[offset] !== 0) {
            if ((msg[offset] & 0xc0) === 0xc0) {
              offset += 2;
              break;
            }
            offset += msg[offset] + 1;
          }
          if (msg[offset] === 0) offset++;
          offset += 4;
        }
        for (let i = 0; i < anCount; i++) {
          let nameStr = "";
          while (offset < msg.length) {
            if ((msg[offset] & 0xc0) === 0xc0) {
              offset += 2;
              break;
            }
            if (msg[offset] === 0) {
              offset++;
              break;
            }
            const len = msg[offset++];
            const label = msg.slice(offset, offset + len).toString("utf8");
            if (!nameStr) nameStr = label;
            offset += len;
          }
          if (offset + 10 > msg.length) break;
          const type = msg.readUInt16BE(offset);
          offset += 2;
          offset += 6;
          const rdLen = msg.readUInt16BE(offset);
          offset += 2;
          const rdStart = offset;

          if (type === 0x0c) {
            let ptrName = "";
            let pOffset = offset;
            let safety = 0;
            while (
              pOffset < msg.length &&
              msg[pOffset] !== 0 &&
              safety++ < 20
            ) {
              if ((msg[pOffset] & 0xc0) === 0xc0) {
                pOffset = msg.readUInt16BE(pOffset) & 0x3fff;
                continue;
              }
              const len = msg[pOffset++];
              const label = msg.slice(pOffset, pOffset + len).toString("utf8");
              if (!ptrName) ptrName = label;
              pOffset += len;
            }
            if (ptrName && ptrName.length > 1) {
              resolved = true;
              clearTimeout(timer);
              try {
                sock.close();
              } catch {}
              resolve(ptrName);
              return;
            }
          }
          offset = rdStart + rdLen;
        }
      } catch {}
    });

    sock.on("error", () => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    });

    sock.bind(0, () => {
      for (const service of services) {
        const q = buildQuery(service);
        sock.send(q, 0, q.length, MDNS_PORT, ip);
      }
    });
  });
}

function getNetbiosName(ip, timeoutMs = 1500) {
  return new Promise((resolve, reject) => {
    const query = Buffer.from([
      0x00, 0x00, 0x00, 0x10, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x20,

      0x43, 0x4b, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41,
      0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41,
      0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x00, 0x00, 0x21, 0x00,
      0x01,
    ]);

    const socket = dgram.createSocket("udp4");
    let done = false;

    const finish = (err, result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        socket.close();
      } catch {}
      err ? reject(err) : resolve(result);
    };

    const timer = setTimeout(() => {
      console.log(`NBSTAT timeout for ${ip} - no response received`);
      finish(new Error("timeout"));
    }, timeoutMs);

    socket.on("message", (msg) => {
      console.log(
        `NBSTAT raw from ${ip} (${msg.length} bytes):`,
        msg.toString("hex"),
      );
      try {
        let nameCount = 0;
        let nameStart = 0;

        for (const offset of [56, 57, 58, 62]) {
          if (offset < msg.length) {
            const candidate = msg[offset];
            if (candidate > 0 && candidate <= 20) {
              if (offset + 1 + candidate * 18 <= msg.length) {
                nameCount = candidate;
                nameStart = offset + 1;
                break;
              }
            }
          }
        }

        if (!nameCount) {
          finish(new Error("could not find name table"));
          return;
        }

        for (let i = 0; i < nameCount; i++) {
          const base = nameStart + i * 18;
          const type = msg[base + 15];
          const flags = msg.readUInt16BE(base + 16);
          const isGroup = (flags & 0x8000) !== 0;

          if (!isGroup && (type === 0x00 || type === 0x03 || type === 0x20)) {
            const name = msg
              .slice(base, base + 15)
              .toString("ascii")
              .replace(/[\x00-\x1f]/g, "")
              .trim();
            if (name) {
              finish(null, name);
              return;
            }
          }
        }

        finish(new Error("no machine name in table"));
      } catch (e) {
        finish(e);
      }
    });

    socket.on("error", (e) => finish(e));
    socket.send(query, 0, query.length, 137, ip);
  });
}

async function resolveHostname(ip, mdnsNames) {
  if (mdnsNames[ip]) {
    console.log(`  [mdns] ${ip} → ${mdnsNames[ip]}`);
    return mdnsNames[ip];
  }

  return new Promise((resolve) => {
    let settled = false;
    let pending = 3;

    const finish = (name, source) => {
      if (settled) return;
      if (name) {
        settled = true;
        console.log(`  [${source}] ${ip} → ${name}`);
        resolve(name);
      } else {
        pending--;
        if (pending === 0) {
          settled = true;
          console.log(`  [unresolved] ${ip}`);
          resolve(null);
        }
      }
    };

    dns
      .reverse(ip)
      .then((hosts) =>
        finish(hosts?.[0]?.replace(/\.local\.?$/, "") || null, "dns"),
      )
      .catch(() => finish(null, "dns"));

    queryMdnsUnicast(ip)
      .then((name) => finish(name || null, "mdns-unicast"))
      .catch(() => finish(null, "mdns-unicast"));

    const nbPromise =
      process.platform === "win32"
        ? getNetbiosNameWindows(ip).catch(() => null)
        : getNetbiosName(ip).catch(() => null);
    nbPromise.then((name) => finish(name || null, "netbios"));
  });
}

function cleanHostname(hostname, vendor) {
  if (!hostname || hostname === "") return null;

  if (/^\d{1,3}[-.]?\d{1,3}[-.]?\d{1,3}[-.]?\d{1,3}/.test(hostname))
    return null;

  const seriesMatch = hostname.match(/^(.+?series)/i);
  if (seriesMatch) return seriesMatch[1].trim();

  const canonJunk = hostname.replace(/\s+_[0-9A-F]{6,}$/i, "").trim();
  if (canonJunk !== hostname) return canonJunk;

  const googleMatch = hostname.match(/^(Google[-\w]+?)-[0-9a-f]{20,}$/i);
  if (googleMatch) return googleMatch[1].replace(/-/g, " ");

  if (hostname.toLowerCase() === "amzn") return null;

  if (/^([0-9a-f]{2}[-:]){2,}/i.test(hostname)) return null;

  return hostname;
}

ipcMain.handle("bonjour:install", async () => {
  shell.openExternal("https://support.apple.com/kb/DL999");
  return { success: true };
});

ipcMain.handle("bonjour:check", async () => {
  const installed = await checkBonjourInstalled();
  return { installed };
});
ipcMain.handle("scan:start", async () => {
  console.log("SCAN STARTED");
  try {
    const mdnsNames = await getMdnsNames();
    const output = execSync("arp -a").toString();

    const raw = [];
    for (const line of output.split("\n")) {
      const match = line.match(
        /^\s*([\d.]+)\s+([0-9a-f]{2}[-:][0-9a-f]{2}[-:][0-9a-f]{2}[-:][0-9a-f]{2}[-:][0-9a-f]{2}[-:][0-9a-f]{2})\s+\w+/i,
      );
      if (!match) continue;
      const ip = match[1];
      const mac = match[2].replace(/-/g, ":").toUpperCase();
      if (mac === "FF:FF:FF:FF:FF:FF") continue;
      if (
        ip.startsWith("224.") ||
        ip.startsWith("239.") ||
        ip === "255.255.255.255"
      )
        continue;
      if (raw.find((d) => d.ip === ip)) continue;
      raw.push({ ip, mac });
    }

    const BATCH = 6;
    const devices = [];

    for (let i = 0; i < raw.length; i += BATCH) {
      const batch = raw.slice(i, i + BATCH);
      const results = await Promise.all(
        batch.map(async ({ ip, mac }) => {
          const [hostname, vendor] = await Promise.all([
            resolveHostname(ip, mdnsNames),
            lookupVendor(mac),
          ]);
          const cleanedHostname = cleanHostname(hostname, vendor);
          let finalVendor = vendor;
          if (finalVendor === "Unknown" && cleanedHostname) {
            const h = cleanedHostname.toLowerCase();
            if (h.includes("google")) finalVendor = "Google";
            else if (
              h.includes("amazon") ||
              h.includes("echo") ||
              h.includes("fire")
            )
              finalVendor = "Amazon";
            else if (h.includes("apple")) finalVendor = "Apple";
          }

          return {
            id: ip,
            ip,
            mac,
            hostname: cleanedHostname || ip,
            hostnameResolved: !!cleanedHostname,
            vendor: finalVendor,
            online: true,
            joinedAt: Date.now(),
            ping: null,
          };
        }),
      );
      devices.push(...results);
    }

    for (const d of devices) {
      if (!d.hostnameResolved) {
        const v = d.vendor.toLowerCase();
        if (v.includes("lifi") || v.includes("lifx")) {
          d.hostname = "LIFX Bulb";
          d.hostnameResolved = true;
        } else if (v.includes("arcadyan")) {
          d.hostname = "ISP Modem/Router";
          d.hostnameResolved = true;
        } else if (v.includes("netgear")) {
          d.hostname = "Netgear Router";
          d.hostnameResolved = true;
        } else if (v.includes("google")) {
          d.hostname = "Google Device";
          d.hostnameResolved = true;
        } else if (v.includes("amazon")) {
          d.hostname = "Amazon Device";
          d.hostnameResolved = true;
        } else if (v.includes("apple")) {
          d.hostname = "Apple Device";
          d.nameUnresolved = true;
        } else {
          const firstByte = parseInt(d.mac.slice(0, 2), 16);
          const isRandomized = (firstByte & 0x02) !== 0;
          d.hostname = isRandomized ? "Private Device" : "Network Device";
          d.nameUnresolved = true;
        }
      }
    }

    console.log("DEVICES FOUND:", devices.length);
    devices.forEach((d) =>
      console.log(`  ${d.ip} → ${d.hostname} (${d.vendor})`),
    );
    return devices;
  } catch (e) {
    console.error("SCAN ERROR:", e.message);
    if (e.message.includes("EPERM") || e.message.includes("access"))
      return { error: "permission_denied" };
    return { error: "unknown" };
  }
});

ipcMain.handle("scan:stop", () => ({ status: "stopped" }));

ipcMain.handle("openPermissionSettings", () => {
  if (process.platform === "darwin") {
    shell.openExternal(
      "x-apple.systempreferences:com.apple.preference.security?Privacy_LocalNetwork",
    );
  } else {
    shell.openExternal("ms-settings:privacy-localnetwork");
  }
});

ipcMain.handle("ping:host", async (_e, host) => {
  try {
    const ping = require("ping");
    const res = await ping.promise.probe(host, { timeout: 2 });
    return { alive: res.alive, time: res.time };
  } catch {
    return { alive: false, time: null };
  }
});

ipcMain.handle("speedtest:run", async () => {
  const { execFile } = require("child_process");
  const fs = require("fs");

  function findBinary() {
    const candidates = [
      path.join(process.resourcesPath, "speedtest.exe"),
      path.join(__dirname, "../resources/speedtest.exe"),

      "C:\\Program Files\\Ookla\\Speedtest CLI\\speedtest.exe",
      "C:\\Program Files (x86)\\Ookla\\Speedtest CLI\\speedtest.exe",
      "C:\\Program Files\\Ookla\\speedtest.exe",

      ...(process.env.LOCALAPPDATA
        ? [
            process.env.LOCALAPPDATA +
              "\\Programs\\Ookla\\Speedtest CLI\\speedtest.exe",
            process.env.LOCALAPPDATA + "\\Ookla\\speedtest.exe",
            process.env.LOCALAPPDATA +
              "\\Microsoft\\WinGet\\Packages\\Ookla.Speedtest.CLI_Microsoft.Winget.Source_8wekyb3d8bbwe\\speedtest.exe",
          ]
        : []),
      ...(process.env.APPDATA
        ? [process.env.APPDATA + "\\Ookla\\Speedtest CLI\\speedtest.exe"]
        : []),
      "C:\\ProgramData\\chocolatey\\bin\\speedtest.exe",
      "C:\\tools\\speedtest\\speedtest.exe",
      ...(process.env.USERPROFILE
        ? [
            process.env.USERPROFILE + "\\scoop\\shims\\speedtest.exe",
            process.env.USERPROFILE +
              "\\scoop\\apps\\speedtest\\current\\speedtest.exe",
            process.env.USERPROFILE + "\\Downloads\\speedtest.exe",
            process.env.USERPROFILE + "\\speedtest.exe",
          ]
        : []),
    ];

    console.log("[speedtest] searching for binary...");
    for (const p of candidates) {
      const exists = fs.existsSync(p);
      console.log(`[speedtest]   ${exists ? "FOUND" : "miss "} → ${p}`);
      if (exists) return p;
    }

    console.log("[speedtest]   trying bare 'speedtest' on PATH...");
    return "speedtest.exe";
  }

  const bin = findBinary();
  console.log("[speedtest] using binary:", bin);

  return new Promise((resolve) => {
    execFile(
      bin,
      ["--accept-license", "--accept-gdpr", "--format=json"],
      { timeout: 90_000 },
      (err, stdout, stderr) => {
        if (err) {
          console.error("[speedtest] error:", err.message);
          console.error("[speedtest] stderr:", stderr);

          if (err.code === "ENOENT") {
            const searched = [
              process.env.LOCALAPPDATA,
              process.env.APPDATA,
              process.env.USERPROFILE,
              "C:\\Program Files",
              "C:\\Program Files (x86)",
            ].join(", ");
            return resolve({
              error: `speedtest.exe not found. Searched: ${searched}. Download from https://www.speedtest.net/apps/cli and note the install path.`,
            });
          }
          return resolve({ error: err.message });
        }
        try {
          const data = JSON.parse(stdout);
          resolve({
            download: { bandwidth: data.download.bandwidth },
            upload: { bandwidth: data.upload.bandwidth },
            ping: { latency: data.ping.latency },
          });
        } catch (e) {
          console.error(
            "[speedtest] parse error:",
            e.message,
            "\nstdout:",
            stdout,
          );
          resolve({ error: "Failed to parse speedtest output" });
        }
      },
    );
  });
});

ipcMain.handle("apps:list", async () => {
  const { exec } = require("child_process");
  return new Promise((resolve) => {
    if (process.platform === "win32") {
      exec(
        `powershell -command "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, Publisher, InstallDate, EstimatedSize | Where-Object { $_.DisplayName } | Sort-Object DisplayName | ConvertTo-Json"`,
        (err, stdout) => {
          if (err) return resolve([]);
          try {
            const raw = JSON.parse(stdout);
            const arr = Array.isArray(raw) ? raw : [raw];
            resolve(
              arr
                .filter((a) => a.DisplayName)
                .map((a) => ({
                  name: a.DisplayName,
                  publisher: a.Publisher || "Unknown",
                  installDate: a.InstallDate || null,
                  size: a.EstimatedSize
                    ? Math.round(a.EstimatedSize / 1024)
                    : null,
                })),
            );
          } catch {
            resolve([]);
          }
        },
      );
    } else {
      resolve([]);
    }
  });
});

ipcMain.handle("apps:reveal", (_e, name) => {
  const { exec } = require("child_process");
  return new Promise((resolve) => {
    exec(
      `powershell -command "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object { $_.DisplayName -eq '${name.replace(/'/g, "''")}' } | Select-Object -First 1 -ExpandProperty InstallLocation"`,
      (err, stdout) => {
        const location = stdout?.trim();
        if (!err && location) {
          shell.openPath(location);
        } else {
          shell.openPath("C:\\Program Files");
        }
        resolve({ success: true });
      },
    );
  });
});
ipcMain.handle("shell:openExternal", (_e, url) => shell.openExternal(url));
