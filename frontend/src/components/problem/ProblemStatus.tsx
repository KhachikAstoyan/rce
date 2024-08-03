import { CheckIcon } from "lucide-react";

interface Props {
  solved: boolean;
}

export const ProblemStatus: React.FC<Props> = ({ solved }) => {
  if (!solved) return null;

  return <CheckIcon />;
};
