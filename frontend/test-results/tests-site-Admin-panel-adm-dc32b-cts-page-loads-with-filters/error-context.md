# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/site.spec.cjs >> Admin panel >> admin products page loads with filters
- Location: tests/site.spec.cjs:148:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/filter by status/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/filter by status/i)

```

```yaml
- status "Loading"
- banner:
  - link "Jegzmenswear":
    - /url: /
    - img "Jegzmenswear"
  - link "Home":
    - /url: /
    - img
    - text: Home
  - link "Shop":
    - /url: /shop
    - img
    - text: Shop
  - link "Info":
    - /url: /info
    - img
    - text: Info
  - link "Login":
    - /url: /admin/login
    - img
    - text: Login
  - button "Cart":
    - img
    - text: Cart
- main:
  - heading "Welcome Back" [level=1]
  - text: Username
  - textbox "Username"
  - text: Password
  - textbox "Password"
  - button "Show password":
    - img
  - button "Log In"
- contentinfo:
  - link "Jegzmenswear":
    - /url: /
    - img "Jegzmenswear"
  - link "Refund Policy & Delivery Info":
    - /url: /info
  - link "TikTok":
    - /url: https://www.tiktok.com/@jegzmenswear?_r=1&_t=ZS-98qOpI7At6a
    - img
- link "Chat on WhatsApp":
  - /url: https://wa.me/2349166635320
  - img
```

# Test source

```ts
  56  |     const firstProduct = page.locator('a[href*="/products/"]').first();
  57  |     await firstProduct.click();
  58  |     await expect(page).toHaveURL(/\/products\//);
  59  |     await expect(page.getByText(/₦/).first()).toBeVisible();
  60  |     await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  61  |   });
  62  | 
  63  |   test('add to cart updates button state without opening a popup drawer', async ({ page }) => {
  64  |     await page.goto(`${BASE_URL}/shop`);
  65  |     await page.locator('a[href*="/products/"]').first().click();
  66  | 
  67  |     // Select a size if size buttons are present
  68  |     const sizeButtons = page.locator('button', { hasText: /^(XS|S|M|L|XL|XXL|XXXL)$/ });
  69  |     if (await sizeButtons.count() > 0) {
  70  |       await sizeButtons.first().click();
  71  |     }
  72  | 
  73  |     const addButton = page.getByRole('button', { name: /add to cart/i });
  74  |     await addButton.click();
  75  |     // Should briefly show "Adding..." then "Added to Cart" — check for the success state
  76  |     await expect(page.getByRole('button', { name: /added to cart/i })).toBeVisible({ timeout: 5000 });
  77  |   });
  78  | 
  79  |   test('cart drawer opens and shows added item', async ({ page }) => {
  80  |     await page.goto(`${BASE_URL}/shop`);
  81  |     await page.locator('a[href*="/products/"]').first().click();
  82  |     const sizeButtons = page.locator('button', { hasText: /^(XS|S|M|L|XL|XXL|XXXL)$/ });
  83  |     if (await sizeButtons.count() > 0) {
  84  |       await sizeButtons.first().click();
  85  |     }
  86  |     await page.getByRole('button', { name: /add to cart/i }).click();
  87  |     await page.waitForTimeout(1000);
  88  | 
  89  |     // Open cart via nav bag icon
  90  |     await page.getByRole('button', { name: /cart/i }).first().click();
  91  |     await expect(page.getByRole('link', { name: /view cart/i })).toBeVisible({ timeout: 5000 });
  92  |   });
  93  | 
  94  |   test.skip('checkout form renders and Flutterwave can be triggered (no real payment)', async ({ page }) => {
  95  |     await page.goto(`${BASE_URL}/shop`);
  96  |     await page.locator('a[href*="/products/"]').first().click();
  97  |     const sizeButtons = page.locator('button', { hasText: /^(XS|S|M|L|XL|XXL|XXXL)$/ });
  98  |     if (await sizeButtons.count() > 0) {
  99  |       await sizeButtons.first().click();
  100 |     }
  101 |     await page.getByRole('button', { name: /add to cart/i }).click();
  102 |     await page.waitForTimeout(1000);
  103 |     await page.goto(`${BASE_URL}/checkout`);
  104 | 
  105 |     await page.getByLabel(/full name/i).fill('Test User');
  106 |     await page.getByLabel(/phone number/i).fill('08000000000');
  107 |     await page.getByLabel(/^email/i).fill(randomTestEmail());
  108 |     // Leave DELIVERY selected by default and fill address
  109 |     const addressField = page.getByLabel(/delivery address/i);
  110 |     if (await addressField.isVisible()) {
  111 |       await addressField.fill('123 Test Street, Lagos');
  112 |     }
  113 | 
  114 |     // Confirm the Pay button is present and enabled — do NOT click it,
  115 |     // to avoid triggering a real Flutterwave transaction.
  116 |     await expect(page.getByRole('button', { name: /pay with flutterwave/i })).toBeVisible();
  117 |   });
  118 | 
  119 |   test('newsletter popup can be triggered manually', async ({ page }) => {
  120 |     await page.goto(BASE_URL);
  121 |     // Clear any prior dismissal so the popup is eligible to show
  122 |     await page.evaluate(() => localStorage.removeItem('onfleek_newsletter_popup_dismissed'));
  123 |     // Simulate exit intent by dispatching the real mouseleave event the app listens for
  124 |     await page.evaluate(() => {
  125 |       document.dispatchEvent(new MouseEvent('mouseleave', { clientY: -1 }));
  126 |     });
  127 |     await expect(page.getByText(/before you go/i)).toBeVisible({ timeout: 5000 });
  128 |   });
  129 | 
  130 |   test('WhatsApp contact bubble is present', async ({ page }) => {
  131 |     await page.goto(BASE_URL);
  132 |     const whatsapp = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
  133 |     await expect(whatsapp.first()).toBeVisible();
  134 |   });
  135 | });
  136 | 
  137 | test.describe('Admin panel', () => {
  138 |   test.skip(!hasAdminCreds, 'Set ADMIN_EMAIL and ADMIN_PASSWORD env vars to run admin tests');
  139 | 
  140 |   test('admin can log in', async ({ page }) => {
  141 |     await page.goto(`${BASE_URL}/admin/login`);
  142 |     await page.getByLabel(/username/i).fill(ADMIN_USERNAME);
  143 |     await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
  144 |     await page.getByRole('button', { name: /log ?in/i }).click();
  145 |     await expect(page).toHaveURL(/\/admin/);
  146 |   });
  147 | 
  148 |   test('admin products page loads with filters', async ({ page }) => {
  149 |     await page.goto(`${BASE_URL}/admin/login`);
  150 |     await page.getByLabel(/username/i).fill(ADMIN_USERNAME);
  151 |     await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
  152 |     await page.getByRole('button', { name: /log ?in/i }).click();
  153 |     await expect(page).toHaveURL(/\/admin/);
  154 | 
  155 |     await page.goto(`${BASE_URL}/admin/products`);
> 156 |     await expect(page.getByText(/filter by status/i)).toBeVisible();
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  157 |     await expect(page.getByText(/filter by collection/i)).toBeVisible();
  158 |   });
  159 | 
  160 |   test('archived filter shows archived products or correct empty state', async ({ page }) => {
  161 |     await page.goto(`${BASE_URL}/admin/login`);
  162 |     await page.getByLabel(/username/i).fill(ADMIN_USERNAME);
  163 |     await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
  164 |     await page.getByRole('button', { name: /log ?in/i }).click();
  165 |     await expect(page).toHaveURL(/\/admin/);
  166 | 
  167 |     await page.goto(`${BASE_URL}/admin/products`);
  168 |     await page.getByLabel(/filter by status/i).selectOption({ label: 'Archived' });
  169 |     // Either shows archived products, or a clear "everything's live" message
  170 |     const hasArchivedText = page.getByText(/archived/i);
  171 |     await expect(hasArchivedText.first()).toBeVisible();
  172 |   });
  173 | });
```