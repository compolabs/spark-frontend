import { expect, type Page } from "@playwright/test";

export async function openTermsDialog(page: Page) {
  await page.goto("/");

  const overlay = page.locator('[data-test-id="overlay"]');

  await overlay.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});

  if (await overlay.isVisible()) {
    await page.keyboard.press("Escape");
    if (await overlay.isVisible()) await page.mouse.click(0, 0);
    if (await overlay.isVisible()) await overlay.evaluate((el) => el.remove());
    await expect(overlay).not.toBeVisible();
  }

  await page.locator('button[data-connect-button="true"]').click();
}
