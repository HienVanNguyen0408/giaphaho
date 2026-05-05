import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const publicPages = [
  { path: '/', name: 'Homepage' },
  { path: '/tin-tuc', name: 'News list' },
  { path: '/video', name: 'Video list' },
  { path: '/gia-pha', name: 'Family tree' },
  { path: '/tim-kiem', name: 'Search' },
];

for (const page of publicPages) {
  test(`WCAG 2.1 AA — ${page.name} (${page.path})`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await browserPage.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page: browserPage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging without hard-failing CI immediately
    if (results.violations.length > 0) {
      console.warn(`Accessibility violations on ${page.path}:`);
      for (const v of results.violations as Array<{ impact: string; id: string; description: string; nodes: Array<{ target: unknown }> }>) {
        console.warn(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.warn(`    Target: ${node.target}`);
        }
      }
    }

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(criticalViolations).toHaveLength(0);
  });
}
