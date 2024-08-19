import { api } from "@/lib/api";
import { ISubmission, ITest, ITestSuite, Language, Problem } from "@/lib/types";

const getProblems = async () => {
  const response = await api.get<Problem[]>("/problems");
  return response.data;
};

interface CreateProblemInput {
  name: string;
  description: string;
  difficulty: string;
}

const createProblem = async (problem: CreateProblemInput) => {
  const response = await api.post<Problem>("/problems", problem);
  return response.data;
};

const getProblemDetails = async (id: string) => {
  const response = await api.get<Problem>("/problems/" + id);
  return response.data;
};

const createSubmission = async (
  problemId: string,
  language: Language,
  code: string,
) => {
  const response = await api.post<{ id: string }>("/submissions", {
    solution: code,
    language,
    problemId,
  });

  return response;
};

const getSubmissionStatus = async (submissionId: string) => {
  const response = await api.get<ISubmission>(`/submissions/${submissionId}`);
  return response.data;
};

const createTestSuite = async (problemId: string, testSuite: ITestSuite) => {
  const response = await api.post<ITest>(`/problems/${problemId}/tests`, {
    tests: testSuite,
  });

  return response.data;
};

const createSkeleton = async (
  testId: string,
  language: Language,
  skeleton: string,
) => {
  const response = await api.post<{}>(`/problems/tests/${testId}/skeletons`, {
    language,
    skeleton,
  });

  return response.data;
};

const getPublicTests = async (problemId: string) => {
  const response = await api.get<ITest>(`/problems/${problemId}/tests/public`);
  return response.data;
};

export const problemService = {
  getProblems,
  createProblem,
  getSubmissionStatus,
  getProblemDetails,
  createSubmission,
  createTestSuite,
  getPublicTests,
  createSkeleton,
};
