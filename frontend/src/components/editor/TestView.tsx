import React from "react";
import { ISubmissionResult, ITest, ITestResult } from "../../lib/types";
import { ValueDisplay } from "./ValueDisplay";
import { Badge } from "../shadcn/badge";
import { formatMillisecondsString } from "../../lib/utils";
import { Button } from "@radix-ui/themes";

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

  const currentTestResult = results?.testResults[currentTest];

  return (
    <div className="p-3 pb-8">
      <div className="flex gap-2">
        {testSuite.tests.map((_, index) => (
          <Button
            // we should be fine, since the tests array won't change at all
            key={index}
            onClick={() => setCurrentTest(index)}
            variant={index === currentTest ? "solid" : "soft"}
          >
            Case {index + 1}
          </Button>
        ))}
      </div>

      {currentTestResult?.runtimeMs && (
        <div className="my-3">
          <Badge variant="secondary">
            Runtime: {formatMillisecondsString(currentTestResult?.runtimeMs)}
          </Badge>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-3">
        {Object.entries(testSuite.tests[currentTest]?.inputs || {}).map(
          ([key, value]) => (
            <ValueDisplay label={key} value={value.value} key={key + value} />
          ),
        )}

        {results && (
          <>
            <ExpectedReceived testResults={currentTestResult} />
          </>
        )}

        {currentTestResult?.stdout && (
          <ValueDisplay label="stdout" value={currentTestResult?.stdout} />
        )}

        {currentTestResult?.stderr && (
          <ValueDisplay
            label="stderr"
            className="text-red-600"
            value={currentTestResult?.stderr}
          />
        )}
      </div>
    </div>
  );
};
