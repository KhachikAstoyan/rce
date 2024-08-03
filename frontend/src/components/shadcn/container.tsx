import { cn } from "@/lib/utils";
import { ElementType } from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  element?: ElementType;
}

export const Container: React.FC<Props> = ({
  element,
  className,
  ...props
}) => {
  const Element = element || "div";
  return (
    <Element {...props} className={cn("px-4 lg:px-70 xl:px-48", className)} />
  );
};
