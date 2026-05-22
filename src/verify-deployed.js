const path = require('path');
const fs = require('fs');
module.paths.push(path.join(__dirname, '../node_modules'));
const { chromium } = require('playwright');

const BASE_URL = 'https://choose-easy-app.vercel.app';
const SCREENSHOTS = path.join(__dirname, '../scratch/screenshots');

if (!fs.existsSync(SCREENSHOTS)) fs.mkdirSync(SCREENSHOTS, { recursive: true });

async function save(page, name) {
  const p = path.join(SCREENSHOTS, name + '.png');
  await page.screenshot({ path: p, fullPage: true });
  console.log('  [SCREENSHOT] ' + name);
}

async function login(page, email, password, expectedUrlPattern) {
  await page.goto(BASE_URL + '/login');
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(expectedUrlPattern, { timeout: 20000 });
}

async function run() {
  console.log('--- STARTING PLAYWRIGHT DEPLOYED SITE TEST ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  [BROWSER_ERR] ' + msg.text());
  });

  try {
    // ---- STUDENT ----
    console.log('\n[1] Testing STUDENT (student@chooseeasy.ai / Student@123)...');
    await login(page, 'student@chooseeasy.ai', 'Student@123', '**/dashboard**');
    console.log('  Student dashboard: LOADED');
    await save(page, 'deployed_student_dashboard');

    console.log('\n========================================');
    console.log('  DEPLOYED VERIFICATION TESTS PASSED!');
    console.log('========================================\n');

  } catch (e) {
    console.error('\n[FAILED]', e.message);
    await save(page, 'deployed_verification_failed');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
