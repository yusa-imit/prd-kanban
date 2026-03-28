import { expect, test } from "@playwright/test";

const STAGE_NAMES = [
  "서류심사",
  "코딩테스트",
  "1차 면접",
  "과제전형",
  "2차 면접",
  "임원면접",
  "레퍼런스체크",
  "처우협상",
  "건강검진",
  "최종합격",
  "입사대기",
  "입사완료",
];

test.describe("보드 표시 & 네비게이션", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recruitment");
  });

  test("보드 헤더 표시", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("프론트엔드 개발자 채용");
    await expect(page.getByText("개발팀")).toBeVisible();
    await expect(page.getByText("진행중", { exact: true })).toBeVisible();
  });

  test("12개 전형 컬럼 표시", async ({ page }) => {
    for (const name of STAGE_NAMES) {
      await expect(page.getByRole("link", { name })).toBeAttached();
    }
  });

  test("컬럼 카운트 배지", async ({ page }) => {
    // Each column has 1000 candidates — verify the badge in the first column header
    const columnHeader = page.getByRole("link", { name: "서류심사" }).locator("..");
    await expect(columnHeader.getByText("1000")).toBeVisible();
  });

  test("카드 기본 정보", async ({ page }) => {
    // First card: 김민수 with tags 신입, React, Angular and action 접수완료
    // Card's data-slot="card" gets overridden to "context-menu-trigger" by Radix asChild
    const card = page
      .locator('[data-slot="context-menu-trigger"]')
      .filter({ hasText: "김민수" })
      .first();
    await expect(card).toBeVisible();
    await expect(card.getByText("신입")).toBeVisible();
    await expect(card.getByText("React")).toBeVisible();
    await expect(card.getByText("접수완료")).toBeVisible();
  });

  test("컬럼 헤더 → 전형 상세 네비게이션", async ({ page }) => {
    await page.getByRole("link", { name: "서류심사" }).click();
    await expect(page).toHaveURL(/\/recruitment\/stage-1$/);
  });

  test("전형 상세 보드 표시", async ({ page }) => {
    await page.goto("/recruitment/stage-1");
    await expect(page.locator("h1")).toContainText("서류심사");
    await expect(page.getByText("1000명")).toBeVisible();

    const actionNames = ["접수완료", "서류검토중", "서류합격", "결과통보"];
    for (const name of actionNames) {
      await expect(page.getByText(name).first()).toBeAttached();
    }
  });

  test("뒤로가기 → 메인 보드", async ({ page }) => {
    await page.goto("/recruitment/stage-1");
    await page.locator('a[href="/recruitment"]').click();
    await expect(page).toHaveURL(/\/recruitment$/);
    await expect(page.locator("h1")).toContainText("프론트엔드 개발자 채용");
  });
});
