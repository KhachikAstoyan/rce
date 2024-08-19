import React from "react";
import { ITestCase } from "../../lib/types";
import { Label } from "../../components/shadcn/label";
import { Input } from "../../components/shadcn/input";
import { Button } from "../../components/shadcn/button";

interface Props {
  setInputs: React.Dispatch<React.SetStateAction<ITestCase["inputs"]>>;
  inputs: ITestCase["inputs"];
}

export const InputBuilder: React.FC<Props> = ({ inputs, setInputs }) => {
  const renameInput = (oldKey: string, newKey: string) => {
    setInputs((prev) => {
      const newInputs = { ...prev };
      newInputs[newKey] = newInputs[oldKey];
      delete newInputs[oldKey];

      return newInputs;
    });
  };

  const onInputTypeChange = (val: string, input: string) => {
    setInputs((prev) => ({
      ...prev,
      [input]: { ...prev[input], type: val },
    }));
  };

  const deleteInput = (key: string) => {
    setInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[key];
      return newInputs;
    });
  };

  const addInput = () => {
    setInputs((prev) => ({
      ...prev,
      [`input${Object.keys(prev).length}`]: { type: "", value: "" },
    }));
  };

  return (
    <div>
      {Object.entries(inputs).map(([key, val]) => (
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

          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => deleteInput(key)}
          >
            Delete
          </Button>
        </div>
      ))}

      <Button className="mt-4" onClick={addInput}>
        Add input
      </Button>
    </div>
  );
};
