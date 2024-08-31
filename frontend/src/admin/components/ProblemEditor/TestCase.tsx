import React from "react";
import { ITestCase } from "../../../lib/types";
import { Input } from "../../../components/shadcn/input";
import { Label } from "../../../components/shadcn/label";
import { Button } from "../../../components/shadcn/button";
import { Checkbox } from "../../../components/shadcn/checkbox";
import { getTypeLabel } from "@/lib/utils";

interface Props {
  testCase: ITestCase;
  index: any;
  inputs: ITestCase["inputs"];
  expectedType: string;
  onChange: (val: ITestCase) => void;
  onDelete: () => void;
}

export const TestCase: React.FC<Props> = ({
  testCase,
  onChange,
  index,
  onDelete,
  inputs,
  expectedType
}) => {
  const changeIsPublic = (val: boolean) => {
    onChange({ ...testCase, isPublic: val });
  };

  return (
    <div className="border-y py-2">
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(inputs).map(([key, val]) => (
          <div>
            <Label htmlFor={key + "value"}>
              {key} <span className="text-gray-500">{getTypeLabel(val.type)}</span>
            </Label>
            <Input
              id={key + "value"}
              placeholder={"Value"}
              value={testCase.inputs[key]?.value}
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
      </div>

      <div className="flex gap-2">
        <div>
          <Label htmlFor="expectedValue">Expected Value ({getTypeLabel(expectedType)})</Label>
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
      </div>
      <div className="flex justify-between mt-3">
        <div className="flex gap-2 items-center">
          <Checkbox
            checked={testCase.isPublic}
            onCheckedChange={changeIsPublic}
            id={"isPublic" + index}
          />
          <Label htmlFor={"isPublic" + index}>Public</Label>
        </div>
        <Button variant="destructive" onClick={onDelete}>
          Delete test case
        </Button>
      </div>
    </div>
  );
};
