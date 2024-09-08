import { Link } from "@tanstack/react-router";
import { Button } from "@/components/shadcn/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/avatar";
import { Logo } from "../../components/common/Logo";
import { UserMenu } from "../../components/common/UserMenu";

export const EditorHeader = () => {
  const { auth, isLoggedIn } = useAuth();
  const user = auth.user;

  return (
    <header className="flex px-3 py-1 items-center justify-between gap-4 border-b bg-background">
      <div className="">
        <Logo />
      </div>
      <div className="h-8 flex items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="none"
                className="rounded-full h-8 w-8"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>{user?.name[0]}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <UserMenu />
          </DropdownMenu>
        ) : (
          <Link to="/login" className="text-foreground">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};
