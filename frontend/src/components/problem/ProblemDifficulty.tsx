import { Problem } from "@/lib/types";
import { capitalize } from "@/lib/utils";
import { Badge } from "@radix-ui/themes";

interface Props {
  difficulty: Problem["difficulty"];
}

const getVariant = (
  difficulty: Problem["difficulty"],
): React.ComponentProps<typeof Badge>["color"] => {
  switch (difficulty) {
    case "easy":
      return "green";
    case "medium":
      return "yellow";
    case "hard":
      return "red";
  }
};

export const ProblemDifficulty: React.FC<Props> = ({ difficulty }) => {
  return <Badge color={getVariant(difficulty)}>{capitalize(difficulty)}</Badge>;
};
