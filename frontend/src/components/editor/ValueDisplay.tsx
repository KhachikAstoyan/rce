import React from "react";
import { cn } from "../../lib/utils";

interface Props extends React.HTMLAttributes<HTMLPreElement> {
  value: string;
  label: string;
}

export const ValueDisplay: React.FC<Props> = ({
  value,
  label,
  className,
  ...props
}) => {
  return (
    <div>
      <h3>{label}</h3>
      <pre
        {...props}
        className={cn(
          "bg-neutral-100 dark:bg-slate-800 p-3 rounded",
          className,
        )}
      >
        {value}
      </pre>
    </div>
  );
};