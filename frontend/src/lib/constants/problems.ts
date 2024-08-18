import { IOption } from "../types";

export const problemDifficultyOptions: readonly IOption[] = [
  {
    label: "Easy",
    value: "easy",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "Hard",
    value: "hard",
  },
] as const;
