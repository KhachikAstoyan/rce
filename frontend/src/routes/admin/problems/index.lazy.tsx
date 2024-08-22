import { createLazyFileRoute } from "@tanstack/react-router";
import { Problems } from "../../../admin/pages/Problems";

export const Route = createLazyFileRoute("/admin/problems/")({
  component: () => <Problems />,
});
