import { test, expect, request } from '@playwright/test';

test('firecrawl health returns availability and sample', async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/api/firecrawl/health`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toHaveProperty('ok');
  expect(body).toHaveProperty('available');
  // When available, sample should be present
  if (body.available) {
    expect(body).toHaveProperty('sample');
    expect(typeof body.sample.success).toBe('boolean');
  }
});
