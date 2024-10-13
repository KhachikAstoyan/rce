import { Problem } from "@/lib/types";
import { capitalize } from "@/lib/utils";
import { Badge, BadgeProps } from "@mantine/core";

interface Props {
  difficulty: Problem["difficulty"];
}

const getVariant = (difficulty: Problem["difficulty"]): BadgeProps["color"] => {
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
  return (
    <Badge variant="light" color={getVariant(difficulty)}>
      {capitalize(difficulty)}
    </Badge>
  );
};
