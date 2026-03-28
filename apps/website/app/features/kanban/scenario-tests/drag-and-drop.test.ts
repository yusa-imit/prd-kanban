import { expect, test, type Page } from "@playwright/test";

/**
 * Dispatch HTML5 DnD events manually.
 * Playwright's dragTo() uses mouse simulation that hangs with Pragmatic DnD,
 * so we dispatch native DragEvent objects directly.
 */
async function performDragAndDrop(page: Page, sourceText: string, targetText: string) {
  // Wait for cards to render (virtualized, so wait for at least one draggable)
  await page.waitForSelector('[draggable="true"]');

  await page.evaluate(
    ({ src, tgt }) => {
      const draggables = document.querySelectorAll<HTMLElement>('[draggable="true"]');
      let source: HTMLElement | null = null;
      let target: HTMLElement | null = null;

      for (const el of draggables) {
        const text = el.textContent ?? "";
        if (!source && text.includes(src)) source = el;
        if (!target && text.includes(tgt)) target = el;
      }
      if (!source || !target) {
        const names = [...draggables].slice(0, 5).map((el) => el.textContent?.slice(0, 30));
        throw new Error(
          `Elements not found: src="${src}", tgt="${tgt}". ` +
            `Found ${draggables.length} draggables. First 5: ${JSON.stringify(names)}`,
        );
      }

      const dataTransfer = new DataTransfer();
      const targetRect = target.getBoundingClientRect();
      const cx = targetRect.left + targetRect.width / 2;
      const cy = targetRect.top + targetRect.height / 2;

      source.dispatchEvent(
        new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer }),
      );
      target.dispatchEvent(
        new DragEvent("dragenter", {
          bubbles: true,
          cancelable: true,
          dataTransfer,
          clientX: cx,
          clientY: cy,
        }),
      );
      target.dispatchEvent(
        new DragEvent("dragover", {
          bubbles: true,
          cancelable: true,
          dataTransfer,
          clientX: cx,
          clientY: cy,
        }),
      );
      target.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer,
          clientX: cx,
          clientY: cy,
        }),
      );
      source.dispatchEvent(
        new DragEvent("dragend", { bubbles: true, cancelable: true, dataTransfer }),
      );
    },
    { src: sourceText, tgt: targetText },
  );
}

test.describe("드래그 앤 드롭", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recruitment");
    // Wait for cards to be rendered by the virtualizer
    await page.waitForSelector('[draggable="true"]');
  });

  test("카드 다른 컬럼으로 드래그", async ({ page }) => {
    // Drag 김민수 (column 1: 서류심사) → 김예린 (column 2: 코딩테스트, first card)
    await performDragAndDrop(page, "김민수", "김예린");

    // Verify CARD_MOVE in Dev Log
    await page.getByRole("button", { name: /Dev Log/ }).click();
    await expect(page.getByText("CARD_MOVE")).toBeVisible();
  });

  test("Dev Log에 드래그 이벤트 기록", async ({ page }) => {
    await performDragAndDrop(page, "김민수", "김예린");

    await page.getByRole("button", { name: /Dev Log/ }).click();
    await expect(page.getByText("DRAG_START")).toBeVisible();
    await expect(page.getByText("DRAG_END")).toBeVisible();
    await expect(page.getByText("CARD_MOVE")).toBeVisible();
  });
});
