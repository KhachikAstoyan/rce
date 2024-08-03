import { Navigation } from "./Navigation";
import { Container } from "@/components/shadcn/container";
import { UserAvatar } from "../../components/common/UserAvatar";

export const Header = () => {
  return (
    <Container
      element="header"
      className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background mb-5"
    >
      <Navigation />

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <UserAvatar />
      </div>
    </Container>
  );
};
