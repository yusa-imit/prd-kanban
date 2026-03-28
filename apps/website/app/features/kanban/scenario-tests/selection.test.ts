import { expect, test } from "@playwright/test";

test.describe("선택 & 벌크 액션", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recruitment");
  });

  test("카드 체크박스 선택", async ({ page }) => {
    const card = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    await card.getByRole("checkbox").click();

    // Ring highlight on selected card
    await expect(card).toHaveClass(/ring-2/);

    // Bulk toolbar shows count
    await expect(page.getByText("1명 선택됨")).toBeVisible();
  });

  test("복수 카드 선택", async ({ page }) => {
    const card1 = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    const card2 = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "이민수" })
      .first();

    await card1.getByRole("checkbox").click();
    await card2.getByRole("checkbox").click();

    await expect(page.getByText("2명 선택됨")).toBeVisible();
  });

  test("벌크 액션 → Dev Log", async ({ page }) => {
    const card1 = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    const card2 = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "이민수" })
      .first();

    await card1.getByRole("checkbox").click();
    await card2.getByRole("checkbox").click();

    // Click bulk "메시지 보내기"
    await page.getByRole("button", { name: "메시지 보내기" }).click();

    // Open Dev Log and verify bulk action log
    await page.getByRole("button", { name: /Dev Log/ }).click();
    await expect(page.getByText("MENU_ACTION")).toBeVisible();
    await expect(page.getByText(/2명 벌크 액션/)).toBeVisible();
  });

  test("전체 해제", async ({ page }) => {
    const card = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    await card.getByRole("checkbox").click();
    await expect(page.getByText("1명 선택됨")).toBeVisible();

    await page.getByRole("button", { name: "전체 해제" }).click();
    await expect(page.getByText(/명 선택됨/)).not.toBeVisible();
  });

  test("컬럼 전체선택", async ({ page }) => {
    await page.getByLabel("서류심사 전체 선택").click();
    await expect(page.getByText("1000명 선택됨")).toBeVisible();
  });

  test("컬럼 전체선택 해제", async ({ page }) => {
    // Select all
    await page.getByLabel("서류심사 전체 선택").click();
    await expect(page.getByText("1000명 선택됨")).toBeVisible();

    // Deselect all
    await page.getByLabel("서류심사 전체 선택").click();
    await expect(page.getByText(/명 선택됨/)).not.toBeVisible();
  });

  test("indeterminate 상태", async ({ page }) => {
    // Select all in first column
    await page.getByLabel("서류심사 전체 선택").click();
    await expect(page.getByText("1000명 선택됨")).toBeVisible();

    // Deselect one card
    const card = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    await card.getByRole("checkbox").click();

    // Column checkbox should be in indeterminate state
    await expect(page.getByLabel("서류심사 전체 선택")).toHaveAttribute(
      "data-state",
      "indeterminate",
    );
    await expect(page.getByText("999명 선택됨")).toBeVisible();
  });
});
