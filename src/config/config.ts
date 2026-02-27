import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(__dirname, "config.json");

// ================= READ CONFIG =================
export function readConfig(): any {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.writeFileSync(
        CONFIG_PATH,
        JSON.stringify({ lastPush: null, lastPull: null }, null, 2)
      );
    }
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read config:", err);
    return { lastPush: null, lastPull: null };
  }
}

// ================= WRITE CONFIG =================
export function writeConfig(data: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write config:", err);
  }
}

// ================= GET LAST PUSH =================
export function getLastPush(): string | null {
  const config = readConfig();
  return config.lastPush || null;
}

// ================= GET LAST PULL =================
export function getLastPull(): string | null {
  const config = readConfig();
  return config.lastPull || null;
}

// ================= UPDATE LAST PUSH =================
export function updateLastPush(timestamp?: string) {
  const config = readConfig();
  config.lastPush = timestamp || new Date().toISOString();
  writeConfig(config);
}

// ================= UPDATE LAST PULL =================
export function updateLastPull(timestamp?: string) {
  const config = readConfig();
  config.lastPull = timestamp || new Date().toISOString();
  writeConfig(config);
}