package com.solution;

import org.json.*;
import java.io.*;
import java.util.*;
import java.time.*;
import java.util.concurrent.Callable;

class Value {
    public String type;
    public String value;

    public Value(String type, String value) {
        this.type = type;
        this.value = value;
    }

    @Override
    public String toString() {
      return this.type + " " + this.value + " VALUE";
    }
}

class TestSuite {
    public String problemId;
    public List<JSONObject> tests;

    public TestSuite(String problemId, List<JSONObject> tests) {
        this.problemId = problemId;
        this.tests = tests;
    }
}

class JsonConverter {
  public static String toJson(Object obj) {
    if (obj instanceof int[] || obj instanceof double[]) {
      return new JSONArray(obj).toString();
    } else if (obj.getClass().isArray()) {
      return new JSONArray(Arrays.asList((Object[])obj)).toString();
    } else if (obj instanceof Number || obj instanceof Boolean) {
      return obj.toString();
    } else {
      return obj.toString();
    }
  }
}

class TestCaseResult {
    public boolean success;
    public String stdout;
    public String stderr;
    public String runtimeMs;
    public List<JSONObject> assertionResults;

    public TestCaseResult(boolean success, String stdout, String stderr, String runtimeMs, List<JSONObject> assertionResults) {
        this.success = success;
        this.stdout = stdout;
        this.stderr = stderr;
        this.runtimeMs = runtimeMs;
        this.assertionResults = assertionResults;
    }

    public JSONObject toJson() {
        JSONObject json = new JSONObject();
        json.put("success", success);
        json.put("stdout", stdout);
        json.put("stderr", stderr);
        json.put("runtimeMs", runtimeMs);

        if (assertionResults != null) {
            json.put("assertionResults", assertionResults);
        }

        return json;
    }
}

class TestSuiteResult {
    public boolean success;
    public String message;
    public int passed;
    public int failed;
    public List<TestCaseResult> testResults;

    public TestSuiteResult(boolean success, String message, int passed, int failed, List<TestCaseResult> testResults) {
        this.success = success;
        this.message = message;
        this.passed = passed;
        this.failed = failed;
        this.testResults = testResults;
    }

    public JSONObject toJson() {
      JSONObject json = new JSONObject();
      json.put("success", success);
      json.put("message", message);
      json.put("passed", passed);
      json.put("failed", failed);

      // Convert list of testResults to JSONArray
      if (testResults != null) {
        json.put("testResults", testResults.stream()
            .map(TestCaseResult::toJson)
            .collect(java.util.stream.Collectors.toList()));
      }

      return json;
    }
}

@SuppressWarnings({"unchecked", "rawtypes", "deprecation"})
public class Solution {
    

    public static Map<String, Object> measureTimeMs(Callable<Object> cb) throws Exception {
        long start = System.nanoTime();
        Object result = cb.call();
        long end = System.nanoTime();

        Map<String, Object> map = new HashMap<>();
        map.put("result", result);
        map.put("time_ms", (end - start) / 1e6);
        return map;
    }

    public static void main(String[] args) {
        TestSuiteResult testSuiteResult = new TestSuiteResult(true, "", 0, 0, new ArrayList<>());

        try {
            String testsPath = args[0];
            String content = new String(java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(testsPath)));
            JSONObject jsonObject = new JSONObject(content);
            TestSuite testSuite = new TestSuite(jsonObject.getString("problemId"), 
                                                jsonObject.getJSONArray("tests").toList().stream()
                                                    .map(obj -> new JSONObject((Map<String, ?>) obj))
                                                    .collect(java.util.stream.Collectors.toList()));

            for (JSONObject test : testSuite.tests) {
                ByteArrayOutputStream stdoutCapture = new ByteArrayOutputStream();
                ByteArrayOutputStream stderrCapture = new ByteArrayOutputStream();
                PrintStream originalStdout = System.out;
                PrintStream originalStderr = System.err;

                System.setOut(new PrintStream(stdoutCapture));
                System.setErr(new PrintStream(stderrCapture));

                JSONObject expected = test.getJSONObject("expected");
                JSONObject inputs = test.getJSONObject("inputs");
                Map<String, Object> parsedInputs = new HashMap<>();
                for (String key : inputs.keySet()) {
                    JSONObject valueObj = inputs.getJSONObject(key);
                    parsedInputs.put(key, ValueParser.parseValue(new Value(valueObj.getString("type"), valueObj.getString("value"))));
                }

                Map<String, Object> measured = measureTimeMs(() -> Submission.run(parsedInputs));
                Object result = measured.get("result");
                double timeMs = (double) measured.get("time_ms");

                System.setOut(originalStdout);
                System.setErr(originalStderr);

                boolean success = ValueParser.compareValues(new Value(expected.getString("type"), expected.getString("value")), result);
                List<JSONObject> assertionResults = new ArrayList<>();

                assertionResults.add(new JSONObject()
                    .put("expected", expected.getString("value"))
                    .put("received", result != null ? JsonConverter.toJson(result) : "null"));

                TestCaseResult testResult = new TestCaseResult(
                    success,
                    stdoutCapture.toString(),
                    stderrCapture.toString(),
                    String.valueOf(timeMs),
                    assertionResults
                );

                if (testResult.success) {
                    testSuiteResult.passed++;
                } else {
                    testSuiteResult.failed++;
                }

                testSuiteResult.testResults.add(testResult);
            }

            testSuiteResult.success = testSuiteResult.failed == 0;
        } catch (Exception error) {
          error.printStackTrace();
          testSuiteResult.success = false;
          testSuiteResult.message = error.toString();
        } 
        try {
          FileWriter file = new FileWriter("test-results.json");
          // file.write(new JSONObject(testSuiteResult).toString());
          file.write(testSuiteResult.toJson().toString());
          file.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
    }
}
