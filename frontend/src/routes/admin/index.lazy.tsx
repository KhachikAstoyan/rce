import { createLazyFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/admin/Dashboard";

export const Route = createLazyFileRoute("/admin/")({
  component: () => <Dashboard />,
});
