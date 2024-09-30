import React from "react";
import { PanelResizeHandle } from "react-resizable-panels";

export const ResizeHandle: React.FC<{
  direction?: "horizontal" | "vertical";
}> = ({ direction = "horizontal" }) => {
  const size = direction === "horizontal" ? "w-[1px]" : "h-[1px]";
  return (
    <PanelResizeHandle
      hitAreaMargins={{
        coarse: 0,
        fine: 3,
      }}
      className={`${size} bg-secondary hover:bg-primary dark:hover:bg-blue-800 active:bg-blue-300 dark:active:bg-blue-900 transition-colors`}
    />
  );
};
