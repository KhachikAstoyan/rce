import React from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { DropdownMenu } from "@radix-ui/themes";

export const UserMenu: React.FC = () => {
  const { logOut } = useAuth();
  const { toggle } = useTheme();

  return (
    <DropdownMenu.Content>
      <DropdownMenu.Label>My Account</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item>Settings</DropdownMenu.Item>
      <DropdownMenu.Item onClick={toggle}>Theme</DropdownMenu.Item>
      <DropdownMenu.Item>Support</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onClick={logOut}>Logout</DropdownMenu.Item>
    </DropdownMenu.Content>
  );
};
