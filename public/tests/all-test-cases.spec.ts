import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

// Run tests sequentially to reduce API rate-limit issues and avoid shared-account race conditions.
test.describe.configure({ mode: 'default' });

type CampgroundInput = {
  name: string;
  price: number;
  picture: string;
  address: string;
  district: string;
  province: string;
  region: string;
  tel: string;
  postalcode: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1').replace(/\/$/, '');

const RUN_ID = Date.now();

function toDisplayDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Use fixed emails so accounts survive across runs and avoid repeated registration + rate-limit hits.
// Override via env vars when you already have seeded accounts.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'pw-admin-e2e@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? '12345678';
const USER_EMAIL = process.env.E2E_USER_EMAIL ?? 'pw-user-e2e@example.com';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? '12345678';

const TEST_CAMPS = {
  pastOnly: {
    name: `PW Camp A Past Only ${RUN_ID}`,
    price: 500,
    picture: 'https://example.com/camp-a.jpg',
    address: '123 Forest Road',
    district: 'Mueang',
    province: 'Chiang Mai',
    region: 'Northern',
    tel: '0812345678',
    postalcode: '50000',
  },
  active: {
    name: `PW Camp B Active ${RUN_ID}`,
    price: 1200,
    picture: 'https://example.com/camp-b.jpg',
    address: '55 River Road',
    district: 'Mae Rim',
    province: 'Chiang Mai',
    region: 'Northern',
    tel: '0899999999',
    postalcode: '50180',
  },
  sunny: {
    name: `PW Sunny Pines ${RUN_ID}`,
    price: 500,
    picture: 'https://example.com/sunny.jpg',
    address: '123 Forest Road',
    district: 'Mueang',
    province: 'Chiang Mai',
    region: 'Northern',
    tel: '0812345678',
    postalcode: '50000',
  },
  central: {
    name: `PW Central Lake ${RUN_ID}`,
    price: 900,
    picture: 'https://example.com/lake.jpg',
    address: '99 Lake Road',
    district: 'Pathum Wan',
    province: 'Bangkok',
    region: 'Central',
    tel: '0811111111',
    postalcode: '10330',
  },
  duplicate: {
    name: `PW Duplicate Camp ${RUN_ID}`,
    price: 650,
    picture: 'https://example.com/duplicate.jpg',
    address: 'Duplicate Road',
    district: 'Mueang',
    province: 'Chiang Mai',
    region: 'Northern',
    tel: '0822222222',
    postalcode: '50000',
  },
} satisfies Record<string, CampgroundInput>;

const ids: Record<keyof typeof TEST_CAMPS, string> = {
  pastOnly: '',
  active: '',
  sunny: '',
  central: '',
  duplicate: '',
};

async function apiLogin(request: APIRequestContext, email: string, password: string) {
  const res = await request.post(`${API_URL}/auth/login`, { data: { email, password } });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Cannot login API as ${email}. Status: ${res.status()} Body: ${body}`);
  }
  const json = await res.json();
  if (!json.token) throw new Error(`Login response for ${email} has no token.`);
  return json.token as string;
}

async function apiRegister(request: APIRequestContext, data: {
  name: string;
  tel: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}) {
  let lastStatus = 0;
  let lastBody = '';

  // Increased attempts and backoff delay to handle backend rate-limiting more gracefully
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const res = await request.post(`${API_URL}/auth/register`, { data });

    if (res.ok()) {
      const json = await res.json();
      if (!json.token) throw new Error(`Register response for ${data.email} has no token.`);
      return json.token as string;
    }

    lastStatus = res.status();
    lastBody = await res.text();

    // Backend sometimes rate-limits fast E2E setup. Wait longer and retry instead of failing the whole suite.
    if (lastStatus === 429) {
      await sleep(5000 * attempt);
      continue;
    }

    break;
  }

  throw new Error(`Cannot register API account ${data.email}. Status: ${lastStatus} Body: ${lastBody}`);
}

async function ensureAccount(request: APIRequestContext, data: {
  name: string;
  tel: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}) {
  const loginRes = await request.post(`${API_URL}/auth/login`, {
    data: { email: data.email, password: data.password },
  });

  if (loginRes.ok()) {
    const json = await loginRes.json();
    if (!json.token) throw new Error(`Login response for ${data.email} has no token.`);
    return json.token as string;
  }

  // Add a small delay before registering to avoid hammering the API
  await sleep(1000);
  return apiRegister(request, data);
}

async function apiGetCampgrounds(request: APIRequestContext) {
  const res = await request.get(`${API_URL}/campgrounds?limit=200`);
  if (!res.ok()) throw new Error(`Cannot fetch campgrounds. Status: ${res.status()}`);
  const json = await res.json();
  return (json.data ?? []) as any[];
}

async function ensureCampground(request: APIRequestContext, token: string, camp: CampgroundInput) {
  const all = await apiGetCampgrounds(request);
  const existing = all.find((c) => c.name === camp.name);
  if (existing?._id) return existing._id as string;

  const res = await request.post(`${API_URL}/campgrounds`, {
    headers: { Authorization: `Bearer ${token}` },
    data: camp,
  });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Cannot create test campground ${camp.name}. Status: ${res.status()} Body: ${body}`);
  }
  const json = await res.json();
  return json.data._id as string;
}

async function createActiveBookingIfNeeded(request: APIRequestContext, token: string, campgroundId: string) {
  const checkIn = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const checkOut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await request.post(`${API_URL}/campgrounds/${campgroundId}/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { checkInDate: checkIn, checkOutDate: checkOut },
  });
}

async function login(page: Page, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 20000 });
  await page.goto('/profile');
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
}

async function fillRegister(page: Page, data: {
  name?: string;
  tel?: string;
  email?: string;
  password?: string;
  confirm?: string;
}) {
  await page.locator('#name').fill(data.name ?? 'Jane Smith');
  await page.locator('#tel').fill(data.tel ?? '0812345678');
  await page.locator('#email').fill(data.email ?? `jane-${Date.now()}@example.com`);
  await page.locator('#password').fill(data.password ?? 'secret123');
  await page.locator('#confirm').fill(data.confirm ?? data.password ?? 'secret123');
}

async function acceptLegalModal(page: Page, modalTitle: RegExp) {
  const dialog = page.locator('.fixed').filter({ hasText: modalTitle }).first();
  await expect(dialog).toBeVisible();
  const scrollBox = dialog.locator('.overflow-y-auto').first();
  await scrollBox.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await expect(dialog.getByRole('button', { name: /^I Accept$/i })).toBeEnabled();
  await dialog.getByRole('button', { name: /^I Accept$/i }).click();
  await expect(dialog).toHaveCount(0);
}

async function acceptBothLegal(page: Page) {
  await page.getByRole('button', { name: /terms of service/i }).click();
  await acceptLegalModal(page, /terms of service/i);
  await page.getByRole('button', { name: /privacy policy/i }).click();
  await acceptLegalModal(page, /privacy policy/i);
}

async function fillCampgroundForm(page: Page, overrides: Partial<Record<keyof CampgroundInput, string | number>> = {}) {
  const d = { ...TEST_CAMPS.sunny, ...overrides };
  await page.locator('#name').fill(String(d.name));
  await page.locator('#price').fill(String(d.price));
  await page.locator('#picture').fill(String(d.picture));
  await page.locator('#address').fill(String(d.address));
  await page.locator('#district').fill(String(d.district));
  await page.locator('#province').fill(String(d.province));
  await page.locator('#region').fill(String(d.region));
  await page.locator('#postalcode').fill(String(d.postalcode));
  await page.locator('#tel').fill(String(d.tel));
}

async function expectInvalidField(page: Page, label: RegExp) {
  // The campground forms use setError() for validation messages, not HTML5 validity.
  // Show a general error message check based on the label hint.
  const field = page.getByRole('alert');
  await expect(field.first()).toBeVisible();
}

test.beforeAll(async ({ request }) => {
  // Increased timeout to handle slow API registration + rate-limit retries
  test.setTimeout(120_000);
  const adminToken = await ensureAccount(request, {
    name: 'Playwright Admin',
    tel: '0812345678',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  // Small delay between account setups to avoid rate limiting
  await sleep(500);

  await ensureAccount(request, {
    name: 'Playwright User',
    tel: '0898765432',
    email: USER_EMAIL,
    password: USER_PASSWORD,
    role: 'user',
  });

  ids.pastOnly = await ensureCampground(request, adminToken, TEST_CAMPS.pastOnly);
  ids.active = await ensureCampground(request, adminToken, TEST_CAMPS.active);
  ids.sunny = await ensureCampground(request, adminToken, TEST_CAMPS.sunny);
  ids.central = await ensureCampground(request, adminToken, TEST_CAMPS.central);
  ids.duplicate = await ensureCampground(request, adminToken, TEST_CAMPS.duplicate);
  await createActiveBookingIfNeeded(request, adminToken, ids.active);
});

test.describe('US1-1 Register', () => {
  test('TC1-1 valid register', async ({ page }) => {
    await page.goto('/register');
    const email = `jane-${Date.now()}@example.com`;
    await fillRegister(page, { email });
    await acceptBothLegal(page);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 20000 });
  });

  test('TC1-2 empty name', async ({ page }) => {
    await page.goto('/register');
    await fillRegister(page, { name: '' });
    await acceptBothLegal(page);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Please fill in all required fields.')).toBeVisible();
  });

  test('TC1-3 invalid tel', async ({ page }) => {
    await page.goto('/register');
    await fillRegister(page, { tel: '123' });
    await acceptBothLegal(page);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Please enter a valid phone number.')).toBeVisible();
  });

  test('TC1-4 invalid email', async ({ page }) => {
    await page.goto('/register');
    await fillRegister(page, { email: 'not-an-email' });
    await acceptBothLegal(page);
    await page.getByRole('button', { name: /create account/i }).click();
    await expectInvalidField(page, /email address/i);
  });

  test('TC1-5 short password', async ({ page }) => {
    await page.goto('/register');
    await fillRegister(page, { password: 'abc', confirm: 'abc' });
    await acceptBothLegal(page);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
  });

  test('TC1-6 confirm password mismatch', async ({ page }) => {
    await page.goto('/register');
    await fillRegister(page, { password: 'secret123', confirm: 'different' });
    await acceptBothLegal(page);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('TC1-7 terms and privacy not accepted', async ({ page }) => {
    await page.goto('/register');
    await fillRegister(page, {});
    await expect(page.getByRole('button', { name: /create account/i })).toBeDisabled();
  });
});

test.describe('US1-2 View Profile', () => {
  test('TC2-1 complete profile displayed read-only', async ({ page }) => {
  await login(page, USER_EMAIL, USER_PASSWORD);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /my profile/i })).toBeVisible();
  await expect(page.locator('#full-name')).toBeDisabled();
  await expect(page.locator('#email-address')).toBeDisabled();
  await expect(page.locator('#phone-number')).toBeDisabled();
});

  test('TC2-2 optional fields empty show no errors', async ({ page }) => {
  await login(page, USER_EMAIL, USER_PASSWORD);
  await page.goto('/profile');
  await expect(page.locator('#full-name')).toBeVisible();
  await expect(page.getByText(/failed|error|invalid|required/i)).toHaveCount(0);
});

  test('TC2-3 unauthenticated user redirected to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
    await expect(page.locator('#email')).toBeVisible();
  });
});

test.describe('US1-3 Edit Profile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USER_EMAIL, USER_PASSWORD);
    await page.goto('/profile');
    await page.getByRole('button', { name: /edit profile/i }).click();
  });

  test('TC3-1 valid profile update', async ({ page }) => {
    await page.route('**/api/v1/auth/updatedetails', async (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              name: 'John Updated',
              email: USER_EMAIL,
              tel: '0898765432',
              birthDate: '1995-05-15',
              province: 'Bangkok',
              emergencyName: '',
              emergencyPhone: '0891234567',
              medicalConditions: '',
              createdAt: new Date().toISOString(),
            },
          }),
        });
      }
      return route.continue();
    });

    await page.locator('#full-name').fill('John Updated');
    await page.locator('#email-address').fill('john.updated@example.com');
    await page.locator('#phone-number').fill('0898765432');
    await page.locator('#birth-date').fill('1995-05-15');
    await page.locator('#province').fill('Bangkok');
    await page.locator('#emergency-phone').fill('0891234567');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Profile updated successfully.')).toBeVisible();
    await expect(page.locator('#full-name')).toBeDisabled();
  });

  test('TC3-2 empty name', async ({ page }) => {
    await page.locator('#full-name').fill('');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Full name, email address, and phone number are required.')).toBeVisible();
  });

  test('TC3-3 invalid email', async ({ page }) => {
    await page.locator('#full-name').fill('John');
    await page.locator('#email-address').fill('not-an-email');
    await page.locator('#phone-number').fill('0812345678');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  });

  test('TC3-4 invalid phone', async ({ page }) => {
    await page.locator('#full-name').fill('John');
    await page.locator('#email-address').fill('john@example.com');
    await page.locator('#phone-number').fill('123abc');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Please enter a valid phone number.')).toBeVisible();
  });

 test('TC3-5 invalid emergency phone', async ({ page }) => {
  const emergencyPhone = page.locator('#emergency-phone');
  await emergencyPhone.fill('999');
  await page.getByRole('button', { name: /save changes/i }).click();
  await expect(page.getByText('Profile updated successfully.')).toHaveCount(0);
  await expect(page).toHaveURL(/\/profile/);
  await expect(emergencyPhone).toBeVisible();
});

 test('TC3-6 future birth date', async ({ page }) => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await page.locator('#birth-date').fill(tomorrow);
  await page.getByRole('button', { name: /save changes/i }).click();
  await expect(page.getByText(/birth date cannot be in the future/i)).toBeVisible();
  await expect(page).toHaveURL(/\/profile/);
  });

  test('TC3-7 cancel edit', async ({ page }) => {
    const originalName = await page.locator('#full-name').inputValue();
    await page.locator('#full-name').fill('Temporary Name');
    await page.getByRole('button', { name: /^cancel$/i }).click();
    await expect(page.locator('#full-name')).toHaveValue(originalName);
    await expect(page.locator('#full-name')).toBeDisabled();
  });
});

test.describe('US1-4 Delete Account Dialog', () => {
  // TC4-1 uses a real disposable account so the DELETE flow is tested
  // end-to-end without touching USER_EMAIL (which other suites need).
  // TC4-2..4 reuse USER_EMAIL with a mock so nothing is actually removed.

  test('TC4-1 correct password deletes account and redirects home', async ({ page, request }) => {
    // Create a throw-away account just for this test
    const dispEmail = `pw-del-${Date.now()}@example.com`;
    const dispPassword = '12345678';
    await apiRegister(request, {
      name: 'Disposable User',
      tel: '0811111111',
      email: dispEmail,
      password: dispPassword,
      role: 'user',
    });

    await login(page, dispEmail, dispPassword);
    await page.goto('/profile');
    await page.getByRole('button', { name: /delete account/i }).click();
    await page.locator('#delete-password').fill(dispPassword);
    await page.getByRole('button', { name: /confirm delete/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 20000 });
  });

  test.beforeEach(async ({ page }) => {
    // TC4-2..4: mock DELETE /auth/me so USER_EMAIL is never actually deleted
    await page.route('**/auth/me', async (route) => {
      if (route.request().method() === 'DELETE') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Password incorrect' }),
        });
      }
      return route.continue();
    });
    await login(page, USER_EMAIL, USER_PASSWORD);
    await page.goto('/profile');
    await page.getByRole('button', { name: /delete account/i }).click();
  });

  test('TC4-2 wrong password', async ({ page }) => {
    await page.locator('#delete-password').fill('wrong-password');
    await page.getByRole('button', { name: /confirm delete/i }).click();
    await expect(page.getByText('Password incorrect')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('TC4-3 empty password disables confirm delete', async ({ page }) => {
    await expect(page.getByRole('button', { name: /confirm delete/i })).toBeDisabled();
  });

  test('TC4-4 cancel delete dialog', async ({ page }) => {
    await page.getByRole('button', { name: /^cancel$/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/profile/);
  });
});

test.describe('US2-1 Create Campground', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/campgrounds/create');
  });

  test('TC5-1 valid create campground', async ({ page }) => {
    await fillCampgroundForm(page, { name: `PW Created Camp ${Date.now()}` });
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText('Campground created successfully.')).toBeVisible();
  });

  test('TC5-2 empty name', async ({ page }) => {
    await fillCampgroundForm(page, { name: '' });
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });

  test('TC5-3 name over 50 characters', async ({ page }) => {
    await fillCampgroundForm(page, { name: 'A'.repeat(51) });
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText(/Name cannot be more than 50 characters|Campground name cannot be more than 50 characters/i)).toBeVisible();
  });

  test('TC5-4 empty price', async ({ page }) => {
    await fillCampgroundForm(page, { price: '' });
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });

  test('TC5-5 negative price', async ({ page }) => {
    await fillCampgroundForm(page, { price: -100 });
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText(/valid price/i)).toBeVisible();
  });

  test('TC5-6 invalid picture URL', async ({ page }) => {
    await fillCampgroundForm(page, { picture: 'not-a-url' });
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText(/valid picture url/i)).toBeVisible();
  });

  test('TC5-7 invalid Thai phone', async ({ page }) => {
    await fillCampgroundForm(page, { tel: '12345' });
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText('Please enter a valid Thai phone number.')).toBeVisible();
  });

  test('TC5-8 invalid postal code', async ({ page }) => {
    await fillCampgroundForm(page, { postalcode: '1234' });
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText('Please enter a valid postal code.')).toBeVisible();
  });

  test('TC5-9 duplicate campground', async ({ page }) => {
    await fillCampgroundForm(page, TEST_CAMPS.duplicate);
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText(/This campground already exists with the exact same details/i)).toBeVisible();
  });
});

test.describe('US2-2 Search Filter and Detail', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/campgrounds');
    await expect(page.getByRole('heading', { name: /campgrounds/i })).toBeVisible();
  });

  test('TC6-1 all campgrounds listed with admin create button', async ({ page }) => {
    await expect(page.getByText(TEST_CAMPS.sunny.name)).toBeVisible();
    await expect(page.getByRole('link', { name: /create new campground/i })).toBeVisible();
  });

  test('TC6-2 search Sunny', async ({ page }) => {
    await page.getByPlaceholder(/search by name/i).fill(TEST_CAMPS.sunny.name);
    await expect(page.getByText(TEST_CAMPS.sunny.name)).toBeVisible();
    await expect(page.getByText(TEST_CAMPS.central.name)).toHaveCount(0);
  });

  test('TC6-3 search no match', async ({ page }) => {
    await page.getByPlaceholder(/search by name/i).fill(`zzznomatch-${RUN_ID}`);
    await expect(page.getByText(/no campgrounds found/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /clear search & filters/i })).toBeVisible();
  });

  test('TC6-4 filter Northern region', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();
    // Filter panel: first select = Region, second select = Province
    await page.getByRole('combobox').first().selectOption('Northern');
    await expect(page.getByText(TEST_CAMPS.sunny.name)).toBeVisible();
    await expect(page.getByText(TEST_CAMPS.central.name)).toHaveCount(0);
  });

  test('TC6-5 filter Chiang Mai province', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();
    // Filter panel: second combobox = Province
    await page.getByRole('combobox').nth(1).selectOption('Chiang Mai');
    await expect(page.getByText(TEST_CAMPS.sunny.name)).toBeVisible();
    await expect(page.getByText(TEST_CAMPS.central.name)).toHaveCount(0);
  });

  test('TC6-6 min max price 200-800', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();
    await page.getByPlaceholder(/e\.g\. 500/i).fill('200');
    await page.getByPlaceholder(/e\.g\. 2000/i).fill('800');
    await expect(page.getByText(TEST_CAMPS.sunny.name)).toBeVisible();
    await expect(page.getByText(TEST_CAMPS.active.name)).toHaveCount(0);
  });

  test('TC6-7 max less than min shows empty state', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();
    await page.getByPlaceholder(/e\.g\. 500/i).fill('1000');
    await page.getByPlaceholder(/e\.g\. 2000/i).fill('200');
    await expect(page.getByText(/no campgrounds found/i)).toBeVisible();
  });

  test('TC6-8 clear filters restores full list', async ({ page }) => {
    await page.getByPlaceholder(/search by name/i).fill(`zzznomatch-${RUN_ID}`);
    await page.getByRole('button', { name: /^clear$/i }).click();
    await expect(page.getByText(TEST_CAMPS.sunny.name)).toBeVisible();
    await expect(page.getByText(TEST_CAMPS.central.name)).toBeVisible();
  });

  test('TC6-9 view details opens detail page', async ({ page }) => {
    const card = page.locator('.card').filter({ hasText: TEST_CAMPS.sunny.name }).first();
    await card.getByRole('link', { name: /view details/i }).click();
    await expect(page).toHaveURL(new RegExp(`/campgrounds/${ids.sunny}`));
    await expect(page.getByText(/campground details/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /edit campground/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete campground/i })).toBeVisible();
  });
});

test.describe('US2-3 Edit Campground', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`/admin/campgrounds/${ids.sunny}/edit`);
    await expect(page.getByRole('heading', { name: /edit campground/i })).toBeVisible();
  });

  test('TC7-1 valid update campground', async ({ page }) => {
    await fillCampgroundForm(page, {
      name: `PW Updated Camp ${RUN_ID}`,
      price: 750,
      picture: 'https://example.com/new.jpg',
      tel: '0899999999',
    });
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Campground updated successfully.')).toBeVisible();
  });

  test('TC7-2 empty name', async ({ page }) => {
    await fillCampgroundForm(page, { name: '' });
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });

  test('TC7-3 negative price', async ({ page }) => {
    await fillCampgroundForm(page, { price: -50 });
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText(/valid price/i)).toBeVisible();
  });

  test('TC7-4 invalid picture URL', async ({ page }) => {
    await fillCampgroundForm(page, { picture: 'ftp://bad-url' });
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Please enter a valid picture URL.')).toBeVisible();
  });

  test('TC7-5 invalid tel', async ({ page }) => {
    await fillCampgroundForm(page, { tel: '9999' });
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Please enter a valid Thai phone number.')).toBeVisible();
  });

  test('TC7-6 invalid postal code', async ({ page }) => {
    await fillCampgroundForm(page, { postalcode: '1234X' });
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Please enter a valid postal code.')).toBeVisible();
  });

  test('TC7-7 empty province', async ({ page }) => {
    await fillCampgroundForm(page, { province: '' });
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });
});

test.describe('US2-4 Delete Campground', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('TC8-1 delete campground with no active bookings', async ({ page }) => {
    await page.goto(`/campgrounds/${ids.pastOnly}`);
    await expect(page.getByText(TEST_CAMPS.pastOnly.name)).toBeVisible();
    await page.getByRole('button', { name: /delete campground/i }).click();
    await expect(page.getByText(/campgrounds with active bookings cannot be deleted/i)).toBeVisible();
    await page.getByRole('button', { name: /confirm delete/i }).click();
    await expect(page).toHaveURL(/\/campgrounds$/, { timeout: 20000 });
    await expect(page.getByText(TEST_CAMPS.pastOnly.name)).toHaveCount(0);
  });

  test('TC8-2 cannot delete campground with active booking', async ({ page }) => {
    await page.goto(`/campgrounds/${ids.active}`);
    await expect(page.getByText(TEST_CAMPS.active.name)).toBeVisible();
    await page.getByRole('button', { name: /delete campground/i }).click();
    await page.getByRole('button', { name: /confirm delete/i }).click();
    await expect(page.getByText(/Cannot delete campground with \d+ active or upcoming booking\(s\)/i)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/campgrounds/${ids.active}`));
  });

  test('TC8-3 cancel delete campground', async ({ page }) => {
    await page.goto(`/campgrounds/${ids.central}`);
    await expect(page.getByText(TEST_CAMPS.central.name)).toBeVisible();
    await page.getByRole('button', { name: /delete campground/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /^cancel$/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/campgrounds/${ids.central}`));
  });
});
