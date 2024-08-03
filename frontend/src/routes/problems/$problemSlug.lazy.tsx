import { createLazyFileRoute } from "@tanstack/react-router";
import { Problem } from "../../pages/problems/Problem";

export const Route = createLazyFileRoute("/problems/$problemSlug")({
  component: () => <Problem />,
});
