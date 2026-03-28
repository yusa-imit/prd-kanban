import type { Route } from "./+types/home";

export function meta(_args: Route.MetaArgs) {
  return [{ title: "prd-kanban" }, { name: "description", content: "prd-kanban" }];
}

export default function Home() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <h1 className="text-2xl font-bold">prd-kanban</h1>
    </div>
  );
}
