import React from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Menu } from "@mantine/core";

export const UserMenu: React.FC = () => {
  const { logOut } = useAuth();
  const { toggle } = useTheme();

  return (
    <>
      <Menu.Label>My Account</Menu.Label>
      <Menu.Divider />
      <Menu.Item>Settings</Menu.Item>
      <Menu.Item onClick={toggle}>Theme</Menu.Item>
      <Menu.Item>Support</Menu.Item>
      <Menu.Divider />
      <Menu.Item onClick={logOut}>Logout</Menu.Item>
    </>
  );
};
