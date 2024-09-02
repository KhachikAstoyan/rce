import { IValue } from "@/lib/types";
import { IInput } from "../ProblemEditor/types";

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

export function convertTestInputsToInputArr(
  inputs?: Record<string, IValue>,
): IInput[] {
  if(!inputs) return [];

  const converted: IInput[] = [];

  for (const [inputName, inputDetails] of Object.entries(inputs)) {
    converted.push({
      name: inputName,
      type: inputDetails.type,
    });
  }

  return converted;
}
