//USER_CODE_PLACEHOLDER

import fs from "fs";
import util from "util";

declare global {
  function solution(args: Record<string, Value>): any;
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

interface TestCaseResult {
  success: boolean;
  stdout: string;
  stderr: string;
  runtimeMs: string;
  assertionResults: {
    expected: any;
    received: any;
  }[];
}

interface TestSuiteResult {
  success: boolean;
  message: string;
  passed: number;
  failed: number;
  testResults: TestCaseResult[];
}

function parseValue(input: Value): any {
  switch (input.type) {
    case "string":
      return input.value;
    case "number":
    case "int":
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

function measureTimeMs(cb: Function, ...args: any[]) {
  const start = process.hrtime.bigint();
  const result = cb(...args);
  const end = process.hrtime.bigint();

  return {
    result,
    timeMs: Number(end - start) / 1e6,
  };
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
      let testStdout = "";
      let testStderr = "";

      // Capture stdout
      const originalStdoutWrite = process.stdout.write.bind(process.stdout);
      // @ts-ignore
      process.stdout.write = (chunk) => {
        testStdout += chunk;
      };

      // Capture stderr
      const originalStderrWrite = process.stderr.write.bind(process.stderr);
      // @ts-ignore
      process.stderr.write = (chunk) => {
        testStderr += chunk;
      };

      // Capture console.log and console.error
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      console.log = (...args) => {
        const output = util.format(...args) + "\n";
        testStdout += output;
      };
      console.error = (...args) => {
        const output = util.format(...args) + "\n";
        testStderr += output;
      };

      const expected = test.expected.value;

      Object.entries(test.inputs).map(([key, value]) => {
        test.inputs[key] = parseValue(value);
      });

      const { result, timeMs } = measureTimeMs(solution, test.inputs);

      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      const testResult: TestCaseResult = {
        success: compareValues(test.expected, result),
        stdout: testStdout,
        stderr: testStderr,
        runtimeMs: timeMs.toString(),
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
