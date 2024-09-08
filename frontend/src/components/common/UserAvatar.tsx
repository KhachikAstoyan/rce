import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/shadcn/button";
import { UserMenu } from "./UserMenu";

export const UserAvatar = () => {
  const { auth, isLoggedIn } = useAuth();
  const user = auth.user;

  return (
    <>
      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
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
    </>
  );
};
