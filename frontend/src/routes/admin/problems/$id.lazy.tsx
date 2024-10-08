import { createLazyFileRoute } from "@tanstack/react-router";
import { ProblemDetails } from "../../../admin/pages/ProblemDetails";

export const Route = createLazyFileRoute("/admin/problems/$id")({
  component: () => <ProblemDetails />,
});
