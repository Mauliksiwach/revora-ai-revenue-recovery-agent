import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\mauli\\.gemini\\antigravity\\brain\\93d3ddae-e0ab-4e05-9964-1e3cc78bf9e0";
const SCREENSHOTS_DIR = path.resolve("./screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const TABS = [
  { id: "command_center", name: "01_command_center.png", label: "Revenue Command Center" },
  { id: "revenue_detective", name: "02_revenue_detective.png", label: "AI Revenue Detective" },
  { id: "recovery_opportunities", name: "03_recovery_opportunities.png", label: "Recovery Opportunities" },
  { id: "revora_agent", name: "04_revora_agent.png", label: "Revora Agent Control Room" },
  { id: "smart_silence", name: "05_smart_silence.png", label: "Smart Silence & Switch Health" },
  { id: "recovery_lab", name: "06_recovery_lab.png", label: "Recovery Lab Simulator" },
  { id: "decision_timeline", name: "07_decision_timeline.png", label: "Decision Timeline & Audit Ledger" },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log("Launching headless Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1600,1050"],
    defaultViewport: { width: 1600, height: 1050, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();
  console.log("Navigating to http://localhost:5173...");
  await page.goto("http://localhost:5173", { waitUntil: "networkidle0", timeout: 30000 });
  await delay(2500);

  for (const tab of TABS) {
    console.log(`Capturing ${tab.label} (${tab.id})...`);

    // Click tab button
    await page.evaluate((tabId) => {
      const buttons = Array.from(document.querySelectorAll("aside button"));
      const btn = buttons.find((b) => {
        const text = b.textContent || "";
        if (tabId === "command_center" && text.includes("Revenue Command Center")) return true;
        if (tabId === "revenue_detective" && text.includes("AI Revenue Detective")) return true;
        if (tabId === "recovery_opportunities" && text.includes("Recovery Opportunities")) return true;
        if (tabId === "revora_agent" && text.includes("Revora Agent")) return true;
        if (tabId === "smart_silence" && text.includes("Smart Silence")) return true;
        if (tabId === "recovery_lab" && text.includes("Recovery Lab")) return true;
        if (tabId === "decision_timeline" && text.includes("Decision Timeline")) return true;
        return false;
      });
      if (btn) btn.click();
    }, tab.id);

    // Wait for content render
    await delay(2000);

    const localPath = path.join(SCREENSHOTS_DIR, tab.name);
    const artifactPath = path.join(ARTIFACT_DIR, tab.name);

    await page.screenshot({ path: localPath, fullPage: false });
    fs.copyFileSync(localPath, artifactPath);
    console.log(`✅ Saved: ${localPath} and copied to ${artifactPath}`);
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
