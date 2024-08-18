import React from "react";
import { ITestCase } from "../../lib/types";
import { Input } from "../../components/shadcn/input";
import { Label } from "../../components/shadcn/label";
import { Button } from "../../components/shadcn/button";
import { Checkbox } from "../../components/shadcn/checkbox";

interface Props {
  testCase: ITestCase;
  onChange: (val: ITestCase) => void;
  onDelete: () => void;
}

export const TestCase: React.FC<Props> = ({ testCase, onChange, onDelete }) => {
  const onInputTypeChange = (val: string, input: string) => {
    const newInputs = {
      ...testCase.inputs,
      [input]: { ...testCase.inputs[input], type: val },
    };
    onChange({ ...testCase, inputs: newInputs });
  };

  const addInput = () => {
    const newInputs = {
      ...testCase.inputs,
      [`input${Object.keys(testCase.inputs).length}`]: { type: "", value: "" },
    };
    onChange({ ...testCase, inputs: newInputs });
  };

  const changeIsPublic = (val: boolean) => {
    onChange({ ...testCase, isPublic: val });
  };

  const renameInput = (oldKey: string, newKey: string) => {
    const newInputs = Object.entries(testCase.inputs).reduce(
      (acc, [key, val]) => {
        if (key === oldKey) {
          acc[newKey] = val;
        } else {
          acc[key] = val;
        }
        return acc;
      },
      {} as Record<string, { type: string; value: string }>,
    );
    onChange({ ...testCase, inputs: newInputs });
  };

  const deleteInput = (key: string) => {
    const newInputs = Object.entries(testCase.inputs).reduce(
      (acc, [k, val]) => {
        if (k !== key) {
          acc[k] = val;
        }
        return acc;
      },
      {} as Record<string, { type: string; value: string }>,
    );
    onChange({ ...testCase, inputs: newInputs });
  };

  return (
    <div className="border-2 p-4 mb-10">
      {Object.entries(testCase.inputs).map(([key, val]) => (
        <div className="border mb-5 p-3">
          <h2 className="text-lg mb-4 font-bold">Input: {key}</h2>
          {/* TODO: make this a select */}
          <Label htmlFor={key + "name"}>Input Name</Label>
          <Input
            id={key + "name"}
            placeholder={"Name"}
            value={key}
            onChange={(e) => renameInput(key, e.target.value)}
          />

          <Label htmlFor={key + "type"}>Type</Label>
          <Input
            id={key + "type"}
            placeholder={"Type"}
            value={val.type}
            onChange={(e) => onInputTypeChange(e.target.value, key)}
          />

          <Label htmlFor={key + "value"}>{key}</Label>
          <Input
            id={key + "value"}
            placeholder={"Value"}
            value={val.value}
            onChange={(e) =>
              onChange({
                ...testCase,
                inputs: {
                  ...testCase.inputs,
                  [key]: { ...testCase.inputs[key], value: e.target.value },
                },
              })
            }
          />

          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => deleteInput(key)}
          >
            Delete
          </Button>
        </div>
      ))}

      <Button onClick={addInput}>Add Input</Button>

      <div>
        <Label htmlFor="expected">Expected Type</Label>
        <Input
          id="expected"
          placeholder={"Type"}
          value={testCase.expected.type}
          onChange={(e) =>
            onChange({
              ...testCase,
              expected: { ...testCase.expected, type: e.target.value },
            })
          }
        />

        <Label htmlFor="expectedValue">Expected Value</Label>
        <Input
          id="expectedValue"
          placeholder={"Value"}
          value={testCase.expected.value}
          onChange={(e) =>
            onChange({
              ...testCase,
              expected: { ...testCase.expected, value: e.target.value },
            })
          }
        />
      </div>

      <div className="flex justify-between mt-3">
        <div className="flex gap-2 items-center">
          <Checkbox
            checked={testCase.isPublic}
            onCheckedChange={changeIsPublic}
            id="isPublic"
          />
          <Label htmlFor="isPublic">Public</Label>
        </div>
        <Button variant="destructive" onClick={onDelete}>
          Delete test case
        </Button>
      </div>
    </div>
  );
};
