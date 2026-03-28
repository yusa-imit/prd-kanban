import { describe, expect, test } from "vite-plus/test";
import { generateBoardState } from "~/data/dummy-recruitment";

describe("generateBoardState", () => {
  const state = generateBoardState();

  test("generates 12 stages", () => {
    expect(state.stageOrder).toHaveLength(12);
    expect(Object.keys(state.stages)).toHaveLength(12);
  });

  test("generates 1000 candidates per stage (12,000 total)", () => {
    const totalCandidates = Object.keys(state.candidates).length;
    expect(totalCandidates).toBe(12_000);

    for (const stageId of state.stageOrder) {
      expect(state.stageCandidates[stageId]).toHaveLength(1000);
    }
  });

  test("each candidate has required fields", () => {
    const firstCandidate = state.candidates["cand-1"];
    expect(firstCandidate).toBeDefined();
    expect(firstCandidate.id).toBe("cand-1");
    expect(firstCandidate.name).toBeTruthy();
    expect(firstCandidate.tags.length).toBeGreaterThanOrEqual(2);
    expect(firstCandidate.appliedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("is deterministic", () => {
    const state2 = generateBoardState();
    expect(state.candidates["cand-1"].name).toBe(state2.candidates["cand-1"].name);
    expect(state.candidates["cand-500"].tags).toEqual(state2.candidates["cand-500"].tags);
  });
});
