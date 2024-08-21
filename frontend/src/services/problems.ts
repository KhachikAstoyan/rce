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
  onlyPublicTests: boolean = false,
) => {
  const url = onlyPublicTests ? "/submissions/run" : "/submissions";
  const response = await api.post<{ id: string }>(url, {
    solution: code,
    language,
    problemId,
  });

  return response;
};

const getSubmissionStatus = async (submissionId: string) => {
  const response = await api.get<ISubmission>(`/submissions/${submissionId}/status`);
  return response.data;
};

const getRunStatus = async (runId: string) => {
  const response = await api.get<ISubmission>(`/submissions/${runId}/check`);
  return response.data; 
}

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

interface IGetTemplateResponse {
  template: string;
  language: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

const getTemplate = async (problemId: string, language: Language) => {
  const response = await api.get<IGetTemplateResponse>(
    `/problems/${problemId}/templates/${language}`,
  );

  return response.data;
};

interface ICreateTemplatePayload {
  template: string;
  language: string;
}

const createTemplate = async (
  problemId: string,
  payload: ICreateTemplatePayload,
) => {
  const response = await api.post<IGetTemplateResponse>(
    `/problems/${problemId}/templates`,
    payload,
  );

  return response.data;
};

export const problemService = {
  getProblems,
  createProblem,
  getSubmissionStatus,
  getRunStatus,
  getProblemDetails,
  createSubmission,
  createTestSuite,
  getPublicTests,
  createSkeleton,
  getTemplate,
  createTemplate,
};
