//USER_CODE_PLACEHOLDER

import fs from "fs";

declare global {
  function solution(...args: any[]): any;
}

interface Value {
  type: string;
  value: string;
}

interface TestSuite {
  problem_id: string;
  tests: {
    inputs: Record<string, Value>;
    expected: Value;
  }[];
}

interface TestSuiteResult {
  success: boolean;
  passed: number;
  failed: number;
  testResults: {
    success: boolean;
    assertionResults: {
      expected: any;
      received: any;
    }[];
  }[];
}

function run() {
  const args = process.argv.slice(2);
  const testsPath = args[0];
  const testSuite = JSON.parse(fs.readFileSync(testsPath, "utf8")) as TestSuite;
  const testSuiteResult: TestSuiteResult = {
    success: true,
    passed: 0,
    failed: 0,
    testResults: [],
  };

  testSuite.tests.forEach((test) => {
    const inputs = Object.values(test.inputs);
    const expected = test.expected.value;

    const result = solution(...inputs.map((a) => a.value));

    const testResult = {
      success: result === expected,
      assertionResults: [
        {
          expected,
          received: result,
        },
      ],
    };

    if (testResult.success) {
      testSuiteResult.passed++;
    } else {
      testSuiteResult.failed++;
    }

    testSuiteResult.testResults.push(testResult);
  });

  testSuiteResult.success = testSuiteResult.failed === 0;

  fs.writeFileSync("test-results.json", JSON.stringify(testSuiteResult));
}

run();
