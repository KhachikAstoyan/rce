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

export enum Language {
  JavaScript = "javascript",
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
