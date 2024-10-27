import { Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks/useAuth";
import { Logo } from "../../components/common/Logo";
import { UserMenu } from "../../components/common/UserMenu";
import { Menu, Avatar, ActionIcon } from "@mantine/core";

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
          <Menu>
            <Menu.Target>
              <ActionIcon variant="transparent" size="md" radius="lg">
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
      </div>
    </header>
  );
};
