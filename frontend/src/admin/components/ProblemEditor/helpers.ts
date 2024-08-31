import { IValue } from "@/lib/types";
import { IInput } from "./types";

export function convertInputsToTestInput(
  inputs: IInput[],
): Record<string, IValue> {
  const converted: Record<string, IValue> = {};

  for (const input of inputs) {
    converted[input.name] = {
      type: input.type,
      value: "",
    };
  }

  return converted;
}
