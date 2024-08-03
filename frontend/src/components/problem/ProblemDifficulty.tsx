import { Problem } from "@/lib/types";
import { capitalize } from "@/lib/utils";
import { Badge } from "@/components/shadcn/badge";

interface Props {
  difficulty: Problem["difficulty"];
}

const getVariant = (
  difficulty: Problem["difficulty"],
): React.ComponentProps<typeof Badge>["variant"] => {
  switch (difficulty) {
    case "easy":
      return "success";
    case "medium":
      return "warning";
    case "hard":
      return "destructive";
  }
};

export const ProblemDifficulty: React.FC<Props> = ({ difficulty }) => {
  return (
    <Badge variant={getVariant(difficulty)}>{capitalize(difficulty)}</Badge>
  );
};
