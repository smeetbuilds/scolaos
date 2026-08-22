import { expect, test } from '@playwright/test';

test('real ScolaOS server exposes liveness and the fresh-install boundary', async ({ page, request }) => {
  const health = await page.goto('/health');
  expect(health?.status()).toBe(200);
  const healthText = await page.locator('body').innerText();
  expect(JSON.parse(healthText)).toMatchObject({
    status: 'ok',
    service: 'scolaos-server',
  });

  const status = await request.get('/start/installation/status');
  expect(status.status()).toBe(200);
  expect(await status.json()).toMatchObject({
    data: {
      bootState: 'unconfigured',
      phase: 'UNCONFIGURED',
    },
  });

  const blocked = await request.get('/openapi.json');
  expect(blocked.status()).toBe(503);
});
