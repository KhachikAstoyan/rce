import React from "react";
import { ITest } from "../../lib/types";
import { Button } from "../shadcn/button";

interface Props {
  tests?: ITest;
}

export const TestView: React.FC<Props> = ({ tests }) => {
  const testSuite = tests?.testSuite;
  console.log(testSuite);
  const [currentTest, setCurrentTest] = React.useState(0);

  if (!testSuite) return null;

  return (
    <div className="p-3">
      <div className="flex gap-2">
        {testSuite.tests.map((_, index) => (
          <Button
            onClick={() => setCurrentTest(index)}
            variant={index === currentTest ? "default" : "outline"}
          >
            Case {index + 1}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-3">
        {Object.entries(testSuite.tests[currentTest].inputs).map(
          ([key, value]) => (
            <div>
              <h3>{key}</h3>
              <pre className="bg-neutral-100 p-3 rounded">{value.value}</pre>
            </div>
          ),
        )}
      </div>
    </div>
  );
};
