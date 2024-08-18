import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "../../lib/utils";

export const LoadingOverlay: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-in fixed z-50 top-0 left-0 w-full h-full bg-neutral-50 bg-opacity-20 backdrop-blur-sm flex justify-center items-center",
        className,
      )}
      {...props}
    >
      <LoadingSpinner className="text-blue-400 w-8" />
    </div>
  );
};
