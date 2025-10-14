import { test, expect } from '@playwright/test';

test('analyzer returns firecrawl contribution when available', async ({ request, baseURL }) => {
  const res = await request.post(`${baseURL}/api/bot-analyzer/analyze`, {
    data: { url: 'https://example.com' },
    headers: { 'Content-Type': 'application/json' }
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toHaveProperty('success');
  if (!body.success) test.fail(true, 'Analyzer returned failure');
  const result = body.result;
  expect(result).toHaveProperty('domain');
  expect(result).toHaveProperty('sitemap');
  // Firecrawl may be disabled or rate-limited; assert shape if present
  if (result.firecrawl) {
    expect(typeof result.firecrawl.success).toBe('boolean');
    if (result.firecrawl.success) {
      expect(typeof result.firecrawl.discoveredCount).toBe('number');
    }
  }
});
