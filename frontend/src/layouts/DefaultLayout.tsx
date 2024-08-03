import React from "react";
import { Header } from "./header/Header";

export const DefaultLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};
