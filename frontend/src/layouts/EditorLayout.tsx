import React from "react";
import { EditorHeader } from "./header/EditorHeader";

export const EditorLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      <EditorHeader />
      {children}
    </>
  );
};
