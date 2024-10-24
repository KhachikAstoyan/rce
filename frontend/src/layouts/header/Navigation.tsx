import { Sheet, SheetContent, SheetTrigger } from "@/components/shadcn/sheet";
import { Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/common/Logo";
import { ProtectedComponent } from "../../components/security/ProtectedComponent";
import { ActionIcon } from "@mantine/core";

export const Navigation = () => {
  return (
    <>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Logo />
        <Link
          to="/"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Problems
        </Link>
        <Link
          href="#"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Solutions
        </Link>
        <Link
          href="#"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Videos
        </Link>
        <Link
          href="#"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Customers
        </Link>
        <Link
          href="#"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Settings
        </Link>
        <ProtectedComponent roles={["admin"]}>
          <Link
            to="/admin"
            className="text-violet-600 transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        </ProtectedComponent>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <ActionIcon
            variant="light"
            color="gray"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </ActionIcon>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Logo />
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Orders
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Products
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Customers
            </Link>
            <Link href="#" className="hover:text-foreground">
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};
