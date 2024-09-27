// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
// } from "@/components/shadcn/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "./UserMenu";
import { Avatar, DropdownMenu, IconButton } from "@radix-ui/themes";

export const UserAvatar = () => {
  const { auth, isLoggedIn } = useAuth();
  const user = auth.user;

  return (
    <>
      {isLoggedIn ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton radius="full">
              <Avatar src={user?.picture} fallback={user?.name[0]!} />
              <span className="sr-only">Toggle user menu</span>
            </IconButton>
          </DropdownMenu.Trigger>
          <UserMenu />
        </DropdownMenu.Root>
      ) : (
        <Link to="/login" className="text-foreground">
          Login
        </Link>
      )}
    </>
  );
};
