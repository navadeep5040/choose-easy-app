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
  await page.waitForURL(expectedUrlPattern, { timeout: 25000 });
}

async function signout(page) {
  await page.click('button:has-text("Sign Out")');
  await page.waitForSelector('a:has-text("Sign In")', { timeout: 15000 });
}

async function checkProfile(page, role) {
  await page.goto(BASE_URL + '/profile');
  await page.waitForSelector('span:has-text("MEMBER SINCE")', { timeout: 20000 });
  const body = await page.innerText('body');
  if (body.includes('LOADING PROFILE...')) throw new Error(role + ' profile stuck loading!');
  if (body.includes('User not found')) throw new Error(role + ' got "User not found"!');
  if (body.includes('session_expired')) throw new Error(role + ' was session_expired!');
  if (body.includes('SYSTEM ERROR')) throw new Error(role + ' got SYSTEM ERROR on profile!');
  if (role === 'MENTOR' && !body.includes('TOTAL SESSIONS')) throw new Error('Mentor missing TOTAL SESSIONS stat!');
  if (role === 'STUDENT' && !body.includes('TOTAL BOOKINGS')) throw new Error('Student missing TOTAL BOOKINGS stat!');
  console.log('  ' + role + ' profile: OK (stats verified)');
}

async function run() {
  console.log('--- STARTING PLAYWRIGHT DEPLOYED SITE E2E TESTS (ACCURATE HEADINGS WAIT) ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  [BROWSER_ERR] ' + msg.text());
  });

  try {
    // ---- ADMIN ----
    console.log('\n[1] Testing ADMIN (admin@chooseeasy.ai / Admin@123)...');
    await login(page, 'admin@chooseeasy.ai', 'Admin@123', '**/admin**');
    await page.waitForSelector('h1:has-text("ADMIN_CONSOLE")', { timeout: 15000 });
    console.log('  Admin dashboard: LOADED');
    await save(page, 'deployed_admin_dashboard');

    await checkProfile(page, 'ADMIN');
    await save(page, 'deployed_admin_profile');

    // Admin should not see student booking/enroll CTAs when browsing mentors
    await page.goto(BASE_URL + '/mentors');
    await page.waitForSelector('body', { timeout: 15000 });
    const mentorsBody = await page.innerText('body');
    if (mentorsBody.includes('Book Session') || mentorsBody.includes('Enroll')) {
      console.log('  [WARNING] Admin saw student booking/enroll actions on mentors page!');
    } else {
      console.log('  Admin browsing mentors: OK (no student CTAs visible)');
    }
    
    // Check Admin security: trying to go to student /dashboard should redirect to /admin
    await page.goto(BASE_URL + '/dashboard');
    await page.waitForURL('**/admin**', { timeout: 15000 });
    console.log('  Admin access to /dashboard: REDIRECTED to /admin (Correct)');

    // Check Admin security: trying to go to mentor dashboard should redirect to /admin
    await page.goto(BASE_URL + '/mentor-dashboard');
    await page.waitForURL('**/admin**', { timeout: 15000 });
    console.log('  Admin access to /mentor-dashboard: REDIRECTED to /admin (Correct)');

    await signout(page);
    console.log('  Admin: LOGGED OUT');

    // ---- MENTOR ----
    console.log('\n[2] Testing MENTOR (mentor@chooseeasy.ai / Mentor@123)...');
    await login(page, 'mentor@chooseeasy.ai', 'Mentor@123', '**/mentor-dashboard**');
    await page.waitForSelector('h1:has-text("MENTOR_DASHBOARD")', { timeout: 15000 });
    console.log('  Mentor dashboard: LOADED');
    await save(page, 'deployed_mentor_dashboard');

    await checkProfile(page, 'MENTOR');
    await save(page, 'deployed_mentor_profile');

    // Mentor should not see student booking/enroll actions
    await page.goto(BASE_URL + '/mentors');
    await page.waitForSelector('body', { timeout: 15000 });
    const mentorBrowseBody = await page.innerText('body');
    if (mentorBrowseBody.includes('Book Session') || mentorBrowseBody.includes('Enroll')) {
      console.log('  [WARNING] Mentor saw student booking/enroll actions on mentors page!');
    } else {
      console.log('  Mentor browsing mentors: OK (no student CTAs visible)');
    }

    // Check Mentor security: trying to go to /admin should redirect to /mentor-dashboard
    await page.goto(BASE_URL + '/admin');
    await page.waitForURL('**/mentor-dashboard**', { timeout: 15000 });
    console.log('  Mentor access to /admin: REDIRECTED to /mentor-dashboard (Correct)');

    // Check Mentor security: trying to go to student /dashboard should redirect to /mentor-dashboard
    await page.goto(BASE_URL + '/dashboard');
    await page.waitForURL('**/mentor-dashboard**', { timeout: 15000 });
    console.log('  Mentor access to /dashboard: REDIRECTED to /mentor-dashboard (Correct)');

    await signout(page);
    console.log('  Mentor: LOGGED OUT');

    // ---- STUDENT ----
    console.log('\n[3] Testing STUDENT (student@chooseeasy.ai / Student@123)...');
    await login(page, 'student@chooseeasy.ai', 'Student@123', '**/dashboard**');
    await page.waitForSelector('h1:has-text("Welcome, Navadeep Kumar")', { timeout: 15000 });
    console.log('  Student dashboard: LOADED');
    await save(page, 'deployed_student_dashboard');

    await checkProfile(page, 'STUDENT');
    await save(page, 'deployed_student_profile');

    // Check Student security: trying to go to /admin should redirect to /dashboard
    await page.goto(BASE_URL + '/admin');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('  Student access to /admin: REDIRECTED to /dashboard (Correct)');

    // Check Student security: trying to go to /mentor-dashboard should redirect to /dashboard
    await page.goto(BASE_URL + '/mentor-dashboard');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('  Student access to /mentor-dashboard: REDIRECTED to /dashboard (Correct)');

    // ---- Course browsing (as student) ----
    console.log('\n[4] Testing course browsing...');
    await page.goto(BASE_URL + '/courses');
    await page.waitForSelector('body', { timeout: 15000 });
    await save(page, 'deployed_courses_page');
    console.log('  Courses page: LOADED');

    // ---- Mentor browsing (as student) ----
    console.log('\n[5] Testing mentor browsing...');
    await page.goto(BASE_URL + '/mentors');
    await page.waitForSelector('body', { timeout: 15000 });
    await save(page, 'deployed_mentors_page');
    console.log('  Mentors page: LOADED');

    console.log('\n======================================================');
    console.log('  ALL DEPLOYED PRODUCTION VERIFICATION TESTS PASSED!');
    console.log('  Admin & Redirection Security:  OK');
    console.log('  Mentor & Redirection Security: OK');
    console.log('  Student & Redirection Security:OK');
    console.log('  Courses & Mentors:            OK');
    console.log('======================================================\n');

  } catch (e) {
    console.error('\n[FAILED]', e.message);
    await save(page, 'deployed_verification_failed');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
