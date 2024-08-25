// the imports are going to be injected at build time
public class Solution {

    interface Value {
        String getType();
        String getValue();
    }

    static class StringValue implements Value {
        private final String value;

        public StringValue(String value) {
            this.value = value;
        }

        public String getType() {
            return "string";
        }

        public String getValue() {
            return value;
        }
    }

    static class NumberValue implements Value {
        private final String value;

        public NumberValue(String value) {
            this.value = value;
        }

        public String getType() {
            return "number";
        }

        public String getValue() {
            return value;
        }
    }

    static class BooleanValue implements Value {
        private final String value;

        public BooleanValue(String value) {
            this.value = value;
        }

        public String getType() {
            return "boolean";
        }

        public String getValue() {
            return value;
        }
    }

    static class ArrayValue implements Value {
        private final String value;

        public ArrayValue(String value) {
            this.value = value;
        }

        public String getType() {
            return "array";
        }

        public String getValue() {
            return value;
        }
    }

    static class TestSuite {
        String problemId;
        List<Test> tests;

        static class Test {
            Map<String, Value> inputs;
            Value expected;
        }
    }

    static class TestCaseResult {
        boolean success;
        String stdout;
        String stderr;
        String runtimeMs;
        List<AssertionResult> assertionResults;

        static class AssertionResult {
            Object expected;
            Object received;
        }
    }

    static class TestSuiteResult {
        boolean success;
        String message;
        int passed;
        int failed;
        List<TestCaseResult> testResults;
    }

    static Object parseValue(Value input) {
        switch (input.getType()) {
            case "string":
                return input.getValue();
            case "number":
                return Double.parseDouble(input.getValue());
            case "boolean":
                return Boolean.parseBoolean(input.getValue());
            case "array":
                return new JSONArray(input.getValue()).toList();
            default:
                throw new IllegalArgumentException("Unknown type");
        }
    }

    static boolean compareValues(Value expected, Object received) {
        switch (expected.getType()) {
            case "string":
                return received.equals(expected.getValue());
            case "number":
                return received.equals(Double.parseDouble(expected.getValue()));
            case "boolean":
                return received.equals(Boolean.parseBoolean(expected.getValue()));
            case "array":
                return received.equals(new JSONArray(expected.getValue()).toList());
            default:
                throw new IllegalArgumentException("Unknown type");
        }
    }

    static long measureTimeMs(Runnable task) {
        long start = System.nanoTime();
        task.run();
        long end = System.nanoTime();
        return (end - start) / 1_000_000;
    }

    public static void main(String[] args) {
        TestSuiteResult testSuiteResult = new TestSuiteResult();
        testSuiteResult.success = true;
        testSuiteResult.passed = 0;
        testSuiteResult.failed = 0;
        testSuiteResult.testResults = new ArrayList<>();

        try {
            String testsPath = args[1];
            String testSuiteJson = new String(Files.readAllBytes(Paths.get(testsPath)));
            TestSuite testSuite = new JSONObject(testSuiteJson).toJavaObject(TestSuite.class);

            for (TestSuite.Test test : testSuite.tests) {
                ByteArrayOutputStream stdout = new ByteArrayOutputStream();
                ByteArrayOutputStream stderr = new ByteArrayOutputStream();
                PrintStream originalOut = System.out;
                PrintStream originalErr = System.err;

                System.setOut(new PrintStream(stdout));
                System.setErr(new PrintStream(stderr));

                Map<String, Object> parsedInputs = new HashMap<>();
                for (Map.Entry<String, Value> entry : test.inputs.entrySet()) {
                    parsedInputs.put(entry.getKey(), parseValue(entry.getValue()));
                }

                long timeMs = measureTimeMs(() -> {
                    // Call the solution function with parsed inputs
                    Submission.run(parsedInputs);
                });

                System.setOut(originalOut);
                System.setErr(originalErr);

                TestCaseResult testResult = new TestCaseResult();
                testResult.stdout = stdout.toString();
                testResult.stderr = stderr.toString();
                testResult.runtimeMs = Long.toString(timeMs);

                boolean success = compareValues(test.expected, parsedInputs);
                testResult.success = success;

                if (success) {
                    testSuiteResult.passed++;
                } else {
                    testSuiteResult.failed++;
                }

                testSuiteResult.testResults.add(testResult);
            }

            testSuiteResult.success = testSuiteResult.failed == 0;

        } catch (Exception e) {
            testSuiteResult.success = false;
            testSuiteResult.message = e.getMessage();
        } finally {
            try {
                Files.write(Paths.get("test-results.json"), new JSONObject(testSuiteResult).toString().getBytes());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
