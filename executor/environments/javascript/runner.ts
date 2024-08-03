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

function run() {
  const args = process.argv.slice(2);
  const testsPath = args[0];
  const inputs = JSON.parse(fs.readFileSync(testsPath, "utf8")) as TestSuite;

  const result = solution(...Object.values(inputs).map((a) => a.value));

  console.log(JSON.stringify({ result }));
}

run();
