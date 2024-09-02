import json
import sys
import time
from typing import Any, Dict, List, Tuple
from io import StringIO


class Value:
    def __init__(self, type: str, value: str):
        self.type = type
        self.value = value


class TestSuite:
    def __init__(self, problemId: str, tests: List[Dict[str, Any]]):
        self.problemId = problemId
        self.tests = tests


class TestCaseResult:
    def __init__(
        self,
        success: bool,
        stdout: str,
        stderr: str,
        runtimeMs: str,
        assertionResults: List[Dict[str, Any]],
    ):
        self.success = success
        self.stdout = stdout
        self.stderr = stderr
        self.runtimeMs = runtimeMs
        self.assertionResults = assertionResults


class TestSuiteResult:
    def __init__(
        self,
        success: bool,
        message: str,
        passed: int,
        failed: int,
        testResults: List[TestCaseResult],
    ):
        self.success = success
        self.message = message
        self.passed = passed
        self.failed = failed
        self.testResults = testResults


def parse_value(input: Value) -> Any:
    if input.type == "string":
        return input.value
    elif input.type == "int":
        return int(input.value)
    elif input.type == "boolean": 
        return input.value.lower() == "true"
    elif input.type.startswith("array"):
        return json.loads(input.value)
    else:
        raise ValueError("Unknown type")


def compare_values(expected: Value, received: Any) -> bool:
    if expected.type == "string":
        return received == expected.value
    elif expected.type == "number" or expected.type == "int":
        return received == float(expected.value)
    elif expected.type == "boolean":
        return received == (expected.value.lower() == "true")
    elif expected.type.startswith("array"):
        return json.dumps(received, separators=(',', ':')) == expected.value
    else:
        raise ValueError("Unknown type")


def measure_time_ms(cb: callable, *args) -> Dict[str, Any]:
    start = time.perf_counter_ns()
    result = cb(*args)
    end = time.perf_counter_ns()

    return {"result": result, "time_ms": (end - start) / 1e6}


def run():
    test_suite_result = TestSuiteResult(
        success=True, message="", passed=0, failed=0, testResults=[]
    )

    try:
        args = sys.argv[1:]
        tests_path = args[0]

        with open(tests_path, "r") as f:
            test_suite = TestSuite(**json.load(f))

        for test in test_suite.tests:
            stdout_capture = StringIO()
            stderr_capture = StringIO()

            # sys.stdout = stdout_capture
            # sys.stderr = stderr_capture

            expected = test["expected"]["value"]
            inputs = {k: parse_value(Value(**v)) for k, v in test["inputs"].items()}
            print(inputs)

            measured = measure_time_ms(solution, inputs)
            result = measured["result"]
            time_ms = measured["time_ms"]

            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__

            test_result = TestCaseResult(
                success=compare_values(Value(**test["expected"]), result),
                stdout=stdout_capture.getvalue(),
                stderr=stderr_capture.getvalue(),
                runtimeMs=str(time_ms),
                assertionResults=[
                    {
                        "expected": expected,
                        "received": (
                            json.dumps(result, separators=(',', ':')).strip('"') if result is not None else "null"
                        ),
                    }
                ],
            )

            if test_result.success:
                test_suite_result.passed += 1
            else:
                test_suite_result.failed += 1

            test_suite_result.testResults.append(vars(test_result))

        test_suite_result.success = test_suite_result.failed == 0
    except Exception as error:
        test_suite_result.success = False
        test_suite_result.message = str(error)
    finally:
        with open("test-results.json", "w") as f:
            json.dump(test_suite_result.__dict__, f)


if __name__ == "__main__":
    run()
