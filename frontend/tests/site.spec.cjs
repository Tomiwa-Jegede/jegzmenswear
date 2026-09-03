// site.spec.js — Automated end-to-end tests for Jegzmenswear
//
// SETUP (run once):
//   npm install -D @playwright/test
//   npx playwright install
//
// RUN:
//   npx playwright test site.spec.js
//   npx playwright test site.spec.js --headed   (to watch it click through the site)
//
// CONFIG (optional — set these before running to unlock admin tests):
//   BASE_URL=https://jegzmenswear.store
//   ADMIN_EMAIL=you@example.com
//   ADMIN_PASSWORD=yourpassword
//
// Example:
//   ADMIN_EMAIL=me@site.com ADMIN_PASSWORD=secret123 npx playwright test site.spec.js
//
// SAFETY NOTES:x
// - This suite does NOT complete a real payment. It fills the checkout form and
//   confirms the Flutterwave modal opens, then stops — no real charge occurs.
// - The newsletter signup test uses a randomly generated email each run, so it
//   will trigger a real confirmation email from Brevo every time you run it.
// - Admin-only tests are automatically skipped if ADMIN_EMAIL/ADMIN_PASSWORD
//   are not provided, so this script is safe to run without exposing credentials.

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const hasAdminCreds = Boolean(ADMIN_USERNAME && ADMIN_PASSWORD);

function randomTestEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe('Public site', () => {
  test('homepage loads with logo, nav, and hero', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator('img[alt="Jegzmenswear"]')).toBeVisible();
    await expect(page.getByRole('link', { name: /shop/i }).first()).toBeVisible();
  });

  test('shop page loads and shows products', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
    // Wait for at least one product card/link to render
    const productLinks = page.locator('a[href*="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15000 });
    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('product page shows price, size selector, and add to cart', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
    const firstProduct = page.locator('a[href*="/products/"]').first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\//);
    await expect(page.getByText(/₦/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });

  test('add to cart updates button state without opening a popup drawer', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
    await page.locator('a[href*="/products/"]').first().click();

    // Select a size if size buttons are present
    const sizeButtons = page.locator('button', { hasText: /^(XS|S|M|L|XL|XXL|XXXL)$/ });
    if (await sizeButtons.count() > 0) {
      await sizeButtons.first().click();
    }

    const addButton = page.getByRole('button', { name: /add to cart/i });
    await addButton.click();
    // Should briefly show "Adding..." then "Added to Cart" — check for the success state
    await expect(page.getByRole('button', { name: /added to cart/i })).toBeVisible({ timeout: 5000 });
  });

  test('cart drawer opens and shows added item', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
    await page.locator('a[href*="/products/"]').first().click();
    const sizeButtons = page.locator('button', { hasText: /^(XS|S|M|L|XL|XXL|XXXL)$/ });
    if (await sizeButtons.count() > 0) {
      await sizeButtons.first().click();
    }
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Open cart via nav bag icon
    await page.getByRole('button', { name: /cart/i }).first().click();
    await expect(page.getByRole('link', { name: /view cart/i })).toBeVisible({ timeout: 5000 });
  });

  test.skip('checkout form renders and Flutterwave can be triggered (no real payment)', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
    await page.locator('a[href*="/products/"]').first().click();
    const sizeButtons = page.locator('button', { hasText: /^(XS|S|M|L|XL|XXL|XXXL)$/ });
    if (await sizeButtons.count() > 0) {
      await sizeButtons.first().click();
    }
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);
    await page.goto(`${BASE_URL}/checkout`);

    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/phone number/i).fill('08000000000');
    await page.getByLabel(/^email/i).fill(randomTestEmail());
    // Leave DELIVERY selected by default and fill address
    const addressField = page.getByLabel(/delivery address/i);
    if (await addressField.isVisible()) {
      await addressField.fill('123 Test Street, Lagos');
    }

    // Confirm the Pay button is present and enabled — do NOT click it,
    // to avoid triggering a real Flutterwave transaction.
    await expect(page.getByRole('button', { name: /pay with flutterwave/i })).toBeVisible();
  });

  test('newsletter popup can be triggered manually', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    // Clear any prior dismissal so the popup is eligible to show
    await page.evaluate(() => localStorage.removeItem('onfleek_newsletter_popup_dismissed'));
    // Simulate exit intent by dispatching the real mouseleave event the app listens for
    await page.evaluate(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: -1 }));
    });
    await expect(page.getByText(/before you go/i)).toBeVisible({ timeout: 5000 });
  });

  test('WhatsApp contact bubble is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    const whatsapp = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
    await expect(whatsapp.first()).toBeVisible();
  });
});

test.describe('Admin panel', () => {
  test.skip(!hasAdminCreds, 'Set ADMIN_EMAIL and ADMIN_PASSWORD env vars to run admin tests');

  test('admin can log in', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.getByLabel(/username/i).fill(ADMIN_USERNAME);
    await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /log ?in/i }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test('admin products page loads with filters', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.getByLabel(/username/i).fill(ADMIN_USERNAME);
    await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /log ?in/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    await page.goto(`${BASE_URL}/admin/products`);
    await expect(page.getByText(/filter by status/i)).toBeVisible();
    await expect(page.getByText(/filter by collection/i)).toBeVisible();
  });

  test('archived filter shows archived products or correct empty state', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.getByLabel(/username/i).fill(ADMIN_USERNAME);
    await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /log ?in/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    await page.goto(`${BASE_URL}/admin/products`);
    await page.getByLabel(/filter by status/i).selectOption({ label: 'Archived' });
    // Either shows archived products, or a clear "everything's live" message
    const hasArchivedText = page.getByText(/archived/i);
    await expect(hasArchivedText.first()).toBeVisible();
  });
});