import { expect, test } from "@playwright/test";

test("recruitment page loads with board header", async ({ page }) => {
  await page.goto("/recruitment");
  await expect(page.locator("h1")).toContainText("프론트엔드 개발자 채용");
});
