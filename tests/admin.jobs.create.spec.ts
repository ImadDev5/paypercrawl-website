import { test, expect } from '@playwright/test';

// Contract:
// - Admin session cookie 'admin_session' enables access
// - Create category -> create job -> job appears in list and in public careers

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);

test('admin can create category and job; careers shows it', async ({ page, baseURL, request }) => {
  // Ensure server is up
  const health = await request.get(`${baseURL}/`);
  expect(health.ok()).toBeTruthy();

  // 1) Establish admin session via API
  const adminKey = process.env.ADMIN_API_KEY || 'dev-admin-key';
  // Try to create a session; continue even if it fails (we'll set cookie directly)
  await request.post(`${baseURL}/api/admin/session`, { data: { key: adminKey } }).catch(() => {});
  await page.context().addCookies([
    { name: 'admin_session', value: '1', url: baseURL }
  ]);

  // 2) Create a category
  const catName = `Test Cat ${Date.now()}`;
  const catSlug = slugify(catName);
  const createCat = await request.post(`${baseURL}/api/job-categories`, {
    data: { name: catName, slug: catSlug, icon: 'Code', color: 'blue' },
    headers: { 'Cookie': 'admin_session=1' },
  });
  expect(createCat.ok()).toBeTruthy();
  const { category } = await createCat.json();
  expect(category?.id).toBeTruthy();

  // 3) Create a job in that category
  const title = `QA Tester ${Date.now()}`;
  const createJob = await request.post(`${baseURL}/api/jobs`, {
    data: {
      title,
      category: catName,
      categoryId: category.id,
      type: 'Full-time',
      location: 'Remote',
      description: 'Automated test job',
      active: true,
    },
    headers: { 'Cookie': 'admin_session=1' },
  });
  const body = await createJob.json();
  expect(createJob.ok()).toBeTruthy();
  expect(body?.job?.id).toBeTruthy();

  // 4) Verify it shows on admin/jobs page
  await page.goto(`${baseURL}/admin/jobs`);
  await expect(page.getByText(title)).toBeVisible();

  // 5) Verify it shows on public careers page
  await page.goto(`${baseURL}/careers`);
  await expect(page.getByText(title)).toBeVisible();
});
