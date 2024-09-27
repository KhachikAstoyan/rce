import { Menu } from "lucide-react";
import { Button, IconButton } from "@radix-ui/themes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/shadcn/sheet";
import { SideNavigation, SideNavigationItems } from "./SideNavigation";
import { UserAvatar } from "../../components/common/UserAvatar";

export const AdminLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SideNavigation />
      <div className="flex flex-col">
        <header className="flex h-14 justify-between md:justify-end items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <IconButton variant="outline" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
              </IconButton>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SideNavigationItems />
            </SheetContent>
          </Sheet>
          <UserAvatar />
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};
