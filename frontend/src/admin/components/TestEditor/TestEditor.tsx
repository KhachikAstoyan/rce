import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { InputBuilder } from "../ProblemEditor/InputBuilder";
import { TypeSelector } from "../TypeSelector/TypeSelector";
import { TestCase } from "../ProblemEditor/TestCase";
import { Button } from "@/components/shadcn/button";
import { IInput } from "../ProblemEditor/types";
import { ITestSuite, IValue } from "@/lib/types";
import {
  convertInputsToTestInput,
  convertTestInputsToInputArr,
} from "./helpers";

interface TestEditorProps {
  problemId: string;
  /**
   * if currentTestSuite is passed, then the Editor
   * will switch to display mode, instead of create mode
   */
  currentTestSuite?: ITestSuite;
  /**
   * If this allowEdits is true and the currentTestSuite is passed
   * the component will allow the user to edit the currently passed
   * test suite
   */
  allowEdits?: boolean;
}

export interface TestEditorRef {
  getTestSuite: () => ITestSuite;
  resetState: () => void;
}

const defaultTestSuite: ITestSuite = {
  problemId: "",
  tests: [],
};

export const TestEditor = forwardRef<TestEditorRef, TestEditorProps>(
  ({ problemId, currentTestSuite, allowEdits = true }, ref) => {
    const [inputs, setInputs] = useState<IInput[]>([]);
    const [expectedType, setExpectedType] = useState<string>("");
    const [testSuite, setTestSuite] = useState<ITestSuite>(
      currentTestSuite || defaultTestSuite,
    );

    const initializeState = useCallback(() => {
      if (currentTestSuite) {
        setTestSuite((prev) => ({
          ...prev,
          tests: currentTestSuite.tests,
        }));
        setInputs(
          convertTestInputsToInputArr(currentTestSuite.tests[0]?.inputs),
        );
      }
    }, [currentTestSuite, setTestSuite, setInputs]);

    useImperativeHandle(
      ref,
      () => ({
        getTestSuite: () => testSuite,
        resetState: initializeState,
      }),
      [testSuite],
    );

    useEffect(() => {
      setTestSuite((prev) => ({
        ...prev,
        problemId,
      }));
    }, [problemId]);

    useEffect(initializeState, [currentTestSuite]);

    console.log("testSuite", testSuite);

    const convertedInputs: Record<string, IValue> = useMemo(
      () => convertInputsToTestInput(inputs),
      [inputs],
    );

    const addTestCase = () => {
      setTestSuite({
        ...testSuite,
        tests: [
          ...testSuite.tests,
          {
            inputs: convertedInputs,
            isPublic: true,
            expected: { type: expectedType, value: "" },
          },
        ],
      });
    };

    useEffect(() => {
      const newTestSuite = structuredClone(testSuite);

      newTestSuite.tests.forEach((test) => {
        test.inputs = convertInputsToTestInput(inputs);
      });

      console.log("new", newTestSuite.tests);

      setTestSuite(newTestSuite);
    }, [inputs]);

    return (
      <div>
        <h2 className="text-3xl my-3">Inputs</h2>
        {!testSuite.tests.length && <p>No tests</p>}

        <InputBuilder
          inputs={inputs}
          disabled={!allowEdits}
          setInputs={setInputs}
        />

        <h2 className="text-3xl my-3">Expected type</h2>
        <div className="w-[300px]">
          <TypeSelector
            disabled={!allowEdits}
            value={expectedType}
            onChange={setExpectedType}
          />
        </div>

        {!!testSuite.tests.length && <h2 className="text-3xl my-3">Tests</h2>}
        {testSuite.tests.map((test, index) => (
          <TestCase
            index={index}
            testCase={test}
            allowEdits={allowEdits}
            inputs={convertedInputs}
            expectedType={expectedType}
            onChange={(newTest) => {
              const newTests = [...testSuite.tests];
              newTests[index] = newTest;
              setTestSuite({ ...testSuite, tests: newTests });
            }}
            onDelete={() => {
              const newTests = testSuite.tests.filter((_, i) => i !== index);
              setTestSuite({ ...testSuite, tests: newTests });
            }}
          />
        ))}
        {allowEdits && (
          <Button className="w-min" onClick={addTestCase}>
            Add test case
          </Button>
        )}
      </div>
    );
  },
);
