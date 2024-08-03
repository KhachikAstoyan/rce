import { createRootRoute, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Toaster } from "@/components/shadcn/sonner";
import { useTheme } from "../hooks/useTheme";
import { ThemeProvider } from "../providers/ThemeProvider";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

export const Route = createRootRoute({
  component: () => {
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
  },
});
