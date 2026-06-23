import { chromium } from "playwright";

const BASE = "https://2getherhairstudio.com";
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function runBookingFlow(browser, serviceName) {
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE}/book`);
    await page.waitForLoadState("networkidle");
    await sleep(600);

    // Check what services loaded (real DB vs mock)
    const serviceCards = await page.locator("text=" + serviceName).count();
    if (serviceCards === 0) {
      const bodyText = await page.textContent("body");
      const serviceNames = bodyText.match(/(?:Men's Cut|Fade|Beard|Haircut|Color|Shave|Design|Braids|Kids)/g) ?? [];
      console.log(`  ⚠️  "${serviceName}" not found. Services visible: ${[...new Set(serviceNames)].join(", ")}`);
      await page.close();
      return null;
    }

    await page.click(`text=${serviceName}`);
    await sleep(400);
    console.log(`  ✅ Selected "${serviceName}"`);
    await page.click("button:has-text('Continue')");
    await page.waitForLoadState("networkidle");
    await sleep(600);

    // Step 2: click "No Preference" card (always first)
    await page.click("text=No Preference");
    await sleep(400);
    console.log(`  ✅ Selected stylist`);
    await page.click("button:has-text('Continue')");
    await page.waitForLoadState("networkidle");
    await sleep(800);

    // Step 3: pick first available weekday slot
    const enabledDays = await page.locator("button[aria-label]:not([disabled])").evaluateAll((btns) =>
      btns.map((b) => b.getAttribute("aria-label")).filter((l) => l && !l.includes("Month") && !l.startsWith("Sunday"))
    );

    let picked = null;
    for (const label of enabledDays) {
      await page.click(`button[aria-label="${label}"]`);
      await sleep(3000); // production API needs more time
      const slots = page.locator("button").filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i });
      if (await slots.count() > 0) {
        await slots.first().click();
        await sleep(400);
        picked = label;
        break;
      }
    }
    if (!picked) {
      console.log(`  ⚠️  No available time slots found`);
      await page.screenshot({ path: `C:\\Users\\salin\\AppData\\Local\\Temp\\prod-no-slots-${serviceName.replace(/\W/g,"")}.png` });
      await page.close();
      return null;
    }
    console.log(`  ✅ Picked slot: ${picked}`);
    await page.click("button:has-text('Continue')");
    await sleep(700);

    // Step 4: fill details
    await page.fill("input[name='clientName']", "Test Client").catch(() => {});
    await page.fill("input[name='clientEmail']", "test@example.com").catch(() => {});
    await page.fill("input[name='clientPhone']", "7165550199").catch(() => {});
    await sleep(300);
    await page.click("button:has-text('Continue')");
    await sleep(1000);

    const body = await page.textContent("body");
    await page.screenshot({ path: `C:\\Users\\salin\\AppData\\Local\\Temp\\prod-confirm-${serviceName.replace(/\W/g,"")}.png` });
    await page.close();
    return body;
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    await page.screenshot({ path: `C:\\Users\\salin\\AppData\\Local\\Temp\\prod-error-${serviceName.replace(/\W/g,"")}.png` }).catch(() => {});
    await page.close();
    return null;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // First check what the /book page shows — real or mock services?
  console.log("\n=== Checking service data source ===");
  const checkPage = await browser.newPage();
  await checkPage.goto(`${BASE}/book`);
  await checkPage.waitForLoadState("networkidle");
  await sleep(600);
  const pageText = await checkPage.textContent("body");
  const hasMock = pageText.includes("Men's Cut") && pageText.includes("Fade & Design");
  const hasReal = pageText.includes("Haircut") || pageText.includes("Shave");
  console.log(`  Mock services (old): ${hasMock ? "YES ⚠️" : "no"}`);
  console.log(`  Real services (DB):  ${hasReal ? "YES ✅" : "no"}`);
  const serviceMatches = pageText.match(/(?:Haircut|Shave|Design|Color Treatment|Braids|Kids|Men's Cut|Fade|Beard)/g) ?? [];
  console.log(`  Services found: ${[...new Set(serviceMatches)].join(", ")}`);
  await checkPage.close();

  // Test 1: Color Treatment — mandatory $25 deposit
  console.log("\n=== TEST 1: Color Treatment (requires deposit) ===");
  const colorBody = await runBookingFlow(browser, "Color Treatment");
  if (colorBody !== null) {
    const hasDeposit = colorBody.includes("Deposit required");
    const has25 = colorBody.includes("$25");
    const hasConfirm = colorBody.includes("Confirm Booking");
    const hasSkip = colorBody.includes("pay at the shop instead");
    console.log(`  "Deposit required" notice: ${hasDeposit ? "✅" : "❌"}`);
    console.log(`  $25 amount shown:          ${has25 ? "✅" : "❌"}`);
    console.log(`  "Confirm Booking" button:  ${hasConfirm ? "✅" : "❌"}`);
    console.log(`  Skip button absent:        ${!hasSkip ? "✅" : "❌ (present)"}`);
    console.log(hasDeposit && has25 && !hasSkip ? "\n  ✅ PASS" : "\n  ❌ FAIL");
  }

  // Test 2: Non-deposit service
  const nonDepositService = pageText.includes("Haircut w/razor") ? "Haircut w/razor" : "Men's Cut";
  console.log(`\n=== TEST 2: ${nonDepositService} (no deposit) ===`);
  const hairBody = await runBookingFlow(browser, nonDepositService);
  if (hairBody !== null) {
    const hasDeposit = hairBody.includes("Deposit required");
    const has25 = hairBody.includes("$25");
    const hasConfirm = hairBody.includes("Confirm Booking");
    console.log(`  No deposit UI: ${!hasDeposit && !has25 ? "✅" : "❌ (deposit UI present)"}`);
    console.log(`  "Confirm Booking" button: ${hasConfirm ? "✅" : "❌"}`);
    console.log(!hasDeposit ? "\n  ✅ PASS" : "\n  ❌ FAIL");
  }

  await browser.close();
  console.log("\n=== Done ===");
})();
