import React from "react";
import { Label } from "../../../components/shadcn/label";
import { Input } from "../../../components/shadcn/input";
import { Button } from "@radix-ui/themes";
import { TypeSelector } from "../TypeSelector/TypeSelector";
import { IInput } from "./types";

interface Props {
  setInputs: React.Dispatch<React.SetStateAction<IInput[]>>;
  inputs: IInput[];
  disabled?: boolean;
}

export const InputBuilder: React.FC<Props> = ({
  inputs,
  setInputs,
  disabled,
}) => {
  const renameInput = (index: number, newName: string) => {
    setInputs((prev) => {
      const newInputs = structuredClone(prev);
      newInputs[index].name = newName;

      return newInputs;
    });
  };

  const onInputTypeChange = (index: number, newType: string) => {
    setInputs((prev) => {
      const newInputs = structuredClone(prev);
      newInputs[index].type = newType;

      return newInputs;
    });
  };

  const deleteInput = (index: number) => {
    setInputs((prev) => {
      const copy = structuredClone(prev);

      copy.splice(index, 1);

      return copy;
    });
  };

  const addInput = () => {
    setInputs((prev) => [
      ...prev,
      {
        type: "string",
        name: `input${inputs.length}`,
      },
    ]);
  };

  return (
    <div>
      {inputs.map((input, index) => (
        <div className="flex gap-3 items-center">
          <div>
            <Label htmlFor={input.name + "name"}>Input Name</Label>
            <Input
              id={input.name + "name"}
              placeholder={"Name"}
              value={input.name}
              disabled={disabled}
              onChange={(e) => renameInput(index, e.target.value)}
            />
          </div>
          <div>
            <div className="w-[150px]">
              <Label htmlFor={input.name + "type"}>Type</Label>
              <TypeSelector
                value={input.type}
                disabled={disabled}
                onChange={(newType) => onInputTypeChange(index, newType)}
              />
            </div>
          </div>
          {!disabled && (
            <Button
              color="red"
              className="mt-4"
              onClick={() => deleteInput(index)}
            >
              Delete
            </Button>
          )}
        </div>
      ))}

      {!disabled && (
        <Button className="mt-4" onClick={addInput}>
          Add input
        </Button>
      )}
    </div>
  );
};
