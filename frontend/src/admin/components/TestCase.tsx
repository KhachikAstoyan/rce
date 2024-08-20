import React from "react";
import { ITestCase } from "../../lib/types";
import { Input } from "../../components/shadcn/input";
import { Label } from "../../components/shadcn/label";
import { Button } from "../../components/shadcn/button";
import { Checkbox } from "../../components/shadcn/checkbox";

interface Props {
  testCase: ITestCase;
  inputs: ITestCase["inputs"];
  onChange: (val: ITestCase) => void;
  onDelete: () => void;
}

export const TestCase: React.FC<Props> = ({
  testCase,
  onChange,
  onDelete,
  inputs,
}) => {
  const changeIsPublic = (val: boolean) => {
    onChange({ ...testCase, isPublic: val });
  };

  return (
    <div className="border-2 p-4 mb-10">
      {Object.entries(inputs).map(([key, val]) => (
        <div className="border mb-5 p-3">
          <h2 className="text-lg mb-4 font-bold">Input: {key}</h2>
          {/* TODO: make this a select */}
          <Label htmlFor={key + "name"}>Input Name</Label>
          <Input id={key + "name"} placeholder={"Name"} value={key} disabled />

          <Label htmlFor={key + "type"}>Type</Label>
          <Input
            id={key + "type"}
            placeholder={"Type"}
            disabled
            value={val.type}
          />

          <Label htmlFor={key + "value"}>{key}</Label>
          <Input
            id={key + "value"}
            placeholder={"Value"}
            value={testCase.inputs[key].value}
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
        </div>
      ))}

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
