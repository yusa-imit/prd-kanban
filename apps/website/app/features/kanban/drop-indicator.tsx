import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

export function DropIndicator({ edge }: { edge: Edge }) {
  const isTop = edge === "top";
  return (
    <div
      className="bg-primary pointer-events-none absolute right-0 left-0 z-10 h-0.5"
      style={{ [isTop ? "top" : "bottom"]: -1 }}
    />
  );
}
