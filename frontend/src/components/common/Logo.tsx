import { Link } from "@tanstack/react-router";
import { Braces } from "lucide-react";

export const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 text-lg font-semibold md:text-base text-blue-500"
    >
      <Braces size={20} fontWeight={700} />
      Something
    </Link>
  );
};
