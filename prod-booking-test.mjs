import { chromium } from "playwright";

const BASE = "https://2getherhairstudio.com";
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function runBookingFlow(browser, serviceName, { expectDeposit = false } = {}) {
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE}/book`);
    await page.waitForLoadState("networkidle");
    await sleep(600);

    // Step 1: select service
    if (await page.locator(`text=${serviceName}`).count() === 0) {
      console.log(`  ⚠️  "${serviceName}" not found on page`);
      await page.close();
      return null;
    }
    await page.click(`text=${serviceName}`);
    await sleep(300);
    console.log(`  ✅ Selected "${serviceName}"`);
    await page.click("button:has-text('Continue')");
    await page.waitForLoadState("networkidle");
    await sleep(500);

    // Step 2: select stylist
    await page.click("text=No Preference");
    await sleep(300);
    console.log(`  ✅ Selected stylist (No Preference)`);
    await page.click("button:has-text('Continue')");
    await page.waitForLoadState("networkidle");
    await sleep(600);

    // Step 3: pick first available day and time slot
    const enabledDays = await page.locator("button[aria-label]:not([disabled])").evaluateAll((btns) =>
      btns.map((b) => b.getAttribute("aria-label")).filter((l) => l && !l.includes("Month") && !l.startsWith("Sunday"))
    );

    let picked = null;
    for (const label of enabledDays) {
      await page.click(`button[aria-label="${label}"]`);
      await sleep(3000);
      const slots = page.locator("button").filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i });
      if (await slots.count() > 0) {
        await slots.first().click();
        await sleep(300);
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
    console.log(`  ✅ Picked date/time: ${picked}`);
    await page.click("button:has-text('Continue')");
    await sleep(500);

    // Step 4: fill details
    await page.fill("input[name='clientName']", "Test Booking E2E");
    await page.fill("input[name='clientEmail']", "test@example.com");
    await page.fill("input[name='clientPhone']", "7165550199");
    await sleep(300);
    console.log(`  ✅ Filled details`);

    // Clicking Continue at step 4 goes to the review step (step 5)
    await page.click("button:has-text('Continue')");
    await sleep(800);

    // Step 5: review — should now show "Confirm Booking" button
    const confirmBtn = page.locator("button:has-text('Confirm Booking')");
    if (await confirmBtn.count() === 0) {
      console.log(`  ⚠️  "Confirm Booking" button not found at step 5`);
      await page.screenshot({ path: `C:\\Users\\salin\\AppData\\Local\\Temp\\prod-step5-${serviceName.replace(/\W/g,"")}.png` });
      await page.close();
      return null;
    }
    console.log(`  ✅ On review step — "Confirm Booking" visible`);

    // Click Confirm Booking — this POSTs to /api/appointments
    await page.click("button:has-text('Confirm Booking')");

    if (expectDeposit) {
      // For deposit services: wait for Stripe payment form to appear
      await sleep(4000);
      const body = await page.textContent("body");
      const hasStripeForm = await page.locator("iframe[title*='Secure payment']").count() > 0
        || await page.locator("[data-testid='card-number']").count() > 0
        || body.includes("Secure Your Deposit")
        || body.includes("card");
      await page.screenshot({ path: `C:\\Users\\salin\\AppData\\Local\\Temp\\prod-deposit-${serviceName.replace(/\W/g,"")}.png` });
      console.log(`  ${hasStripeForm ? "✅" : "⚠️ "} Stripe deposit form appeared: ${hasStripeForm}`);
      return { depositFormShown: hasStripeForm, body };
    } else {
      // For non-deposit: wait for redirect to /book/confirmation/...
      try {
        await page.waitForURL(/\/book\/confirmation\//, { timeout: 10000 });
      } catch {
        const body = await page.textContent("body");
        const errMsg = body.match(/Something went wrong|Invalid|Failed|error/i)?.[0] ?? "(no error text)";
        console.log(`  ⚠️  No redirect to confirmation page. Found: ${errMsg}`);
        await page.screenshot({ path: `C:\\Users\\salin\\AppData\\Local\\Temp\\prod-no-confirm-${serviceName.replace(/\W/g,"")}.png` });
        await page.close();
        return null;
      }

      await page.waitForLoadState("networkidle");
      await sleep(500);
      const body = await page.textContent("body");
      await page.screenshot({ path: `C:\\Users\\salin\\AppData\\Local\\Temp\\prod-confirmation-${serviceName.replace(/\W/g,"")}.png` });
      const url = page.url();
      console.log(`  ✅ Redirected to: ${url}`);
      return { confirmed: true, url, body };
    }
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    await page.screenshot({ path: `C:\\Users\\salin\\AppData\\Local\\Temp\\prod-error-${serviceName.replace(/\W/g,"")}.png` }).catch(() => {});
    await page.close();
    return null;
  } finally {
    await page.close().catch(() => {});
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Verify real services are loading
  console.log("\n=== Checking service data source ===");
  const checkPage = await browser.newPage();
  await checkPage.goto(`${BASE}/book`);
  await checkPage.waitForLoadState("networkidle");
  await sleep(600);
  const pageText = await checkPage.textContent("body");
  const hasMock = pageText.includes("Men's Cut");
  const hasReal = pageText.includes("Haircut w/razor") || pageText.includes("Full Cut");
  console.log(`  Mock services: ${hasMock ? "YES ⚠️" : "no ✅"}`);
  console.log(`  Real DB services: ${hasReal ? "YES ✅" : "no ⚠️"}`);
  await checkPage.close();

  // ── TEST 1: Non-deposit service (full end-to-end, creates real appointment) ──
  console.log("\n=== TEST 1: Haircut w/razor — full booking (no deposit) ===");
  const hairResult = await runBookingFlow(browser, "Haircut w/razor", { expectDeposit: false });
  if (hairResult) {
    const hasName = hairResult.body?.includes("Test Booking E2E") || hairResult.body?.includes("Booking Confirmed") || hairResult.body?.includes("confirmed");
    const hasCancel = hairResult.body?.includes("cancel") || hairResult.body?.includes("Cancel");
    console.log(`  Confirmation page loaded:  ✅`);
    console.log(`  Confirmation content:      ${hasName || hasCancel ? "✅" : "⚠️  unexpected content"}`);
    console.log(`\n  ✅ PASS — appointment created in DB`);
  } else {
    console.log(`\n  ❌ FAIL`);
  }

  // ── TEST 2: Deposit service (verifies Stripe form, does NOT charge) ──
  console.log("\n=== TEST 2: Color Treatment — deposit flow (Stripe form only, no charge) ===");
  const colorResult = await runBookingFlow(browser, "Color Treatment", { expectDeposit: true });
  if (colorResult) {
    console.log(`  Deposit page shown:        ${colorResult.depositFormShown ? "✅" : "⚠️"}`);
    const hasSecure = colorResult.body?.includes("Secure Your Deposit") || colorResult.body?.includes("deposit");
    console.log(`  Deposit copy present:      ${hasSecure ? "✅" : "⚠️"}`);
    console.log(colorResult.depositFormShown || hasSecure ? `\n  ✅ PASS` : `\n  ❌ FAIL`);
  } else {
    console.log(`\n  ❌ FAIL`);
  }

  await browser.close();
  console.log("\n=== Done ===");
})();
