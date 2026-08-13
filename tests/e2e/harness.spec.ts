import { expect, test } from '@playwright/test';

test('browser harness renders an accessible ScolaOS document', async ({ page }) => {
  await page.setContent('<main><h1>ScolaOS</h1><p>The open-source operating system for schools.</p></main>');

  await expect(page.getByRole('heading', { name: 'ScolaOS' })).toBeVisible();
  await expect(page.getByText('The open-source operating system for schools.')).toBeVisible();
});
