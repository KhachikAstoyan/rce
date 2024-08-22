import { createLazyFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/admin/pages/Dashboard";

export const Route = createLazyFileRoute("/admin/")({
  component: () => <Dashboard />,
});
