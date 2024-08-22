import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout } from "../admin/layout/AdminLayout";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
});
