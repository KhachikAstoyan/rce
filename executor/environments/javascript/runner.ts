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
  message: string;
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

function parseValue(input: Value): any {
  switch (input.type) {
    case "string":
      return input.value;
    case "number":
      return Number(input.value);
    case "boolean":
      return input.value === "true";
    case "array":
      return JSON.parse(input.value);
    default:
      throw new Error("Unknown type");
  }
}

function compareValues(expected: Value, received: any): boolean {
  switch (expected.type) {
    case "string":
      return received === expected.value;
    case "number":
      return received === Number(expected.value);
    case "boolean":
      return received === (expected.value === "true");
    case "array":
      return JSON.stringify(received) === expected.value;
    default:
      throw new Error("Unknown type");
  }
}

function run() {
  const testSuiteResult: TestSuiteResult = {
    success: true,
    message: "",
    passed: 0,
    failed: 0,
    testResults: [],
  };
  try {
    const args = process.argv.slice(2);
    const testsPath = args[0];
    const testSuite = JSON.parse(
      fs.readFileSync(testsPath, "utf8")
    ) as TestSuite;

    testSuite.tests.forEach((test) => {
      const inputs = Object.values(test.inputs);
      const expected = test.expected.value;

      const result = solution(...inputs.map((a) => parseValue(a)));

      const testResult = {
        success: compareValues(test.expected, result),
        assertionResults: [
          {
            expected,
            received: JSON.stringify(result) || "null",
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
  } catch (error) {
    testSuiteResult.success = false;
    if (error instanceof Error) {
      testSuiteResult.message = error.message;
    } else {
      testSuiteResult.message = "Unknown error";
    }
  } finally {
    fs.writeFileSync("test-results.json", JSON.stringify(testSuiteResult));
  }
}

run();
