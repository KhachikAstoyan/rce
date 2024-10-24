import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "./UserMenu";
import { Avatar, ActionIcon, Menu } from "@mantine/core";

export const UserAvatar = () => {
  const { auth, isLoggedIn } = useAuth();
  const user = auth.user;

  return (
    <>
      {isLoggedIn ? (
        <Menu width={320}>
          <Menu.Target>
            <ActionIcon variant="transparent" size="lg" radius="lg">
              <Avatar src={user?.picture}>
                {!user?.picture && user?.name[0]!}
              </Avatar>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <UserMenu />
          </Menu.Dropdown>
        </Menu>
      ) : (
        <Link to="/login" className="text-foreground">
          Login
        </Link>
      )}
    </>
  );
};
