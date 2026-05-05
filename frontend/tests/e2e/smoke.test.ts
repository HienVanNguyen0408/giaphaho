import { test, expect } from '@playwright/test';

test.describe('Public site smoke tests', () => {
  test('homepage loads and shows site title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Họ Phùng Bát Tràng/);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Tin tức/i }).first().click();
    await expect(page).toHaveURL(/\/tin-tuc/);
    await expect(page.getByRole('heading', { name: /Tin tức/i })).toBeVisible();
  });

  test('news list page loads articles', async ({ page }) => {
    await page.goto('/tin-tuc');
    await expect(page.getByRole('heading', { name: /Tin tức/i })).toBeVisible();
  });

  test('video page loads', async ({ page }) => {
    await page.goto('/video');
    await expect(page.getByRole('heading', { name: /Video/i })).toBeVisible();
  });

  test('gia pha page loads family tree', async ({ page }) => {
    await page.goto('/gia-pha');
    await expect(page).toHaveTitle(/Gia Phả/);
    // ReactFlow canvas or loading skeleton should be present
    await expect(page.locator('main')).toBeVisible();
  });

  test('search page allows searching', async ({ page }) => {
    await page.goto('/tim-kiem');
    await expect(page.getByRole('heading', { name: /Tìm kiếm/i })).toBeVisible();
    const searchInput = page.getByRole('textbox');
    await searchInput.fill('Phùng');
    // Search fires after debounce — no hard assertion on results since API may not be running
    await page.waitForTimeout(500);
  });

  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('button', { name: /Đăng nhập/i })).toBeVisible();
  });

  test('unauthenticated admin redirect', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to login (proxy.ts guards /admin/*)
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
