import { createRootRoute, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Toaster } from "@/components/shadcn/sonner";
import { ThemeProvider } from "../providers/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

const RootRoute: React.FC = () => {
  useAuth(true);
  return (
    <>
      <ThemeProvider>
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
        <Toaster richColors />
        <Outlet />
      </ThemeProvider>
    </>
  );
};

export const Route = createRootRoute({
  component: RootRoute,
});
