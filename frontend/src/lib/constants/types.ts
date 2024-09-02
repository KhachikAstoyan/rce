import { IOption } from "../types";

export const dataTypes: IOption[] = [
  {
    value: "string",
    label: "string",
  },
  {
    value: "int",
    label: "int",
  },
  {
    value: "boolean",
    label: "boolean",
  },
  {
    value: "array-int",
    label: "int[]",
  },
  {
    value: "array-bool",
    label: "boolean[]",
  },
  {
    value: "array-string",
    label: "string[]",
  },
];

export const dataTypeLabelMap = dataTypes.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<string, string>,
);
