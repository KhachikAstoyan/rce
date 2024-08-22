import React from "react";
import { ISubmissionResult, ITest, ITestResult } from "../../lib/types";
import { Button } from "../shadcn/button";
import { ValueDisplay } from "./ValueDisplay";

interface Props {
  tests?: ITest;
  results?: ISubmissionResult;
}

const ExpectedReceived: React.FC<{
  testResults?: ITestResult;
}> = ({ testResults }) => {
  if (!testResults) return null;
  const assertionResults = testResults.assertionResults[0];

  return (
    <>
      <ValueDisplay
        label="Expected"
        className="text-green-600"
        value={assertionResults.expected}
      />
      <ValueDisplay
        label="Received"
        className={testResults.success ? "text-green-600" : "text-red-600"}
        value={assertionResults.received}
      />
    </>
  );
};

export const TestView: React.FC<Props> = ({ tests, results }) => {
  const testSuite = tests?.testSuite;
  console.log(testSuite);
  const [currentTest, setCurrentTest] = React.useState(0);

  if (!testSuite) return null;

  if (results?.message) {
    // return <div className="p-3 text-red-600">{results.message}</div>;
    return (
      <ValueDisplay
        label=""
        value={results.message}
        className="bg-red-100 text-red-600 m-2"
      />
    );
  }

  return (
    <div className="p-3 pb-8">
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
            <ValueDisplay label={key} value={value.value} />
          ),
        )}

        {results && (
          <>
            <ExpectedReceived testResults={results.testResults[currentTest]} />
          </>
        )}

        {results?.testResults[currentTest]?.stdout && (
          <ValueDisplay
            label="stdout"
            value={results?.testResults[currentTest]?.stdout}
          />
        )}

        {results?.testResults[currentTest]?.stderr && (
          <ValueDisplay
            label="stderr"
            className="text-red-600"
            value={results?.testResults[currentTest]?.stderr}
          />
        )}
      </div>
    </div>
  );
};
