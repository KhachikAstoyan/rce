import { Language } from "./constants/languages";

export interface IOption {
  label: string;
  value: string;
}

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
  permissions: string[];
}

export interface Problem {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  supportedLanguages: string[];
  solved: boolean;
}

export interface ITest {
  id: string;
  createdAt: string;
  updatedAt: string;
  language: Language;
  testSuite: ITestSuite;
}

export interface ITestSuite {
  problemId: string;
  tests: ITestCase[];
}

export interface ITestCase {
  isPublic: boolean;
  inputs: Record<string, IValue>;
  expected: IValue;
}

interface IValue {
  type: string;
  value: string;
}

export interface ISubmission {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "completed" | "failed";
  problemId: string;
  userId: string;
  solution: string;
  language: Language;
  results: ISubmissionResult;
}

export interface IAssertionResult {
  expected: string;
  received: string;
}

export interface ITestResult {
  success: boolean;
  assertionResults: IAssertionResult[];
  stdout: string;
  stderr: string;
  runtimeMs: string;
}

export interface ISubmissionResult {
  submissionId: string;
  success: boolean;
  message: string;
  passed: number;
  failed: number;
  testResults: ITestResult[];
}
