import { Link, LinkProps } from "@tanstack/react-router";
import { Home, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { isOnPath } from "../../lib/utils";

const NavigationItem: React.FC<LinkProps & { isActive?: boolean }> = ({
  isActive,
  ...props
}) => {
  return (
    <Link
      {...props}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
        isActive ? "bg-muted text-primary" : "text-muted-foreground"
      }`}
    />
  );
};

export const SideNavigationItems = () => {
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <NavigationItem to="/admin" isActive={isOnPath("/admin")}>
        <Home className="h-4 w-4" />
        Dashboard
      </NavigationItem>
      <NavigationItem
        to="/admin/problems/create"
        isActive={isOnPath("/admin/problems")}
      >
        <ShoppingCart className="h-4 w-4" />
        Create Problem 
      </NavigationItem>
    </nav>
  );
};

export const SideNavigation = () => {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Logo />
        </div>
        <div className="flex-1">
          <SideNavigationItems />
        </div>
      </div>
    </div>
  );
};
