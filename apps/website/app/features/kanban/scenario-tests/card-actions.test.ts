import { expect, test } from "@playwright/test";

test.describe("카드 메뉴 & Dev Log", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recruitment");
  });

  test("카드 우클릭 컨텍스트 메뉴", async ({ page }) => {
    const card = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    await card.click({ button: "right" });

    await expect(page.getByRole("menuitem", { name: "메시지 보내기" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "메모 추가" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "이력서 보기" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "탈락 처리" })).toBeVisible();
  });

  test("컨텍스트 메뉴 액션 → Dev Log", async ({ page }) => {
    const card = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    await card.click({ button: "right" });
    await page.getByRole("menuitem", { name: "메시지 보내기" }).click();

    await page.getByRole("button", { name: /Dev Log/ }).click();
    await expect(page.getByText("MENU_ACTION")).toBeVisible();
    await expect(page.getByText("[메시지 보내기] 김민수")).toBeVisible();
  });

  test("카드 더보기 드롭다운 메뉴", async ({ page }) => {
    const card = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    await card.getByRole("button", { name: "더보기" }).click();

    await expect(page.getByRole("menuitem", { name: "메시지 보내기" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "메모 추가" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "이력서 보기" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "탈락 처리" })).toBeVisible();
  });

  test("드롭다운 메뉴 액션 → Dev Log", async ({ page }) => {
    const card = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    await card.getByRole("button", { name: "더보기" }).click();
    await page.getByRole("menuitem", { name: "탈락 처리" }).click();

    await page.getByRole("button", { name: /Dev Log/ }).click();
    await expect(page.getByText("MENU_ACTION")).toBeVisible();
    await expect(page.getByText("[탈락 처리] 김민수")).toBeVisible();
  });

  test("Dev Log 패널 토글", async ({ page }) => {
    const devLogButton = page.getByRole("button", { name: /Dev Log/ });

    // Open
    await devLogButton.click();
    await expect(page.getByText("인터랙션 로그가 없습니다")).toBeVisible();

    // Close
    await devLogButton.click();
    await expect(page.getByText("인터랙션 로그가 없습니다")).not.toBeVisible();
  });

  test("Dev Log Clear", async ({ page }) => {
    // Generate a log entry
    const card = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    await card.getByRole("button", { name: "더보기" }).click();
    await page.getByRole("menuitem", { name: "메시지 보내기" }).click();

    // Open Dev Log and verify entry exists
    await page.getByRole("button", { name: /Dev Log/ }).click();
    await expect(page.getByText("MENU_ACTION")).toBeVisible();

    // Clear
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(page.getByText("인터랙션 로그가 없습니다")).toBeVisible();
  });
});
