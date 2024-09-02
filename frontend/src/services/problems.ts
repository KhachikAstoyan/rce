import { api } from "@/lib/api";
import { ISubmission, ITest, ITestSuite, Problem } from "@/lib/types";

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
  language: string,
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
  const response = await api.get<ISubmission>(
    `/submissions/${submissionId}/status`,
  );
  return response.data;
};

const getRunStatus = async (runId: string) => {
  const response = await api.get<ISubmission>(`/submissions/${runId}/check`);
  return response.data;
};

const createTestSuite = async (problemId: string, testSuite: ITestSuite) => {
  const response = await api.post<ITest>(`/problems/${problemId}/tests`, {
    tests: testSuite,
  });

  return response.data;
};

const createSkeleton = async (
  problemId: string,
  language: string,
  skeleton: string,
) => {
  const response = await api.post<{}>(`/problems/${problemId}/skeletons`, {
    language,
    skeleton,
  });

  return response.data;
};

const getPublicTests = async (problemId: string) => {
  const response = await api.get<ITest>(`/problems/${problemId}/tests/public`);
  return response.data;
};

const getAllTests = async (problemId: string) => {
  const response = await api.get<ITest>(`/problems/${problemId}/tests`);
  return response.data;
}

interface IGetTemplateResponse {
  template: string;
  language: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

const getTemplate = async (problemId: string, language: string) => {
  const response = await api.get<IGetTemplateResponse>(
    `/problems/${problemId}/templates/${language}`,
  );

  return response.data;
};

const getProblemSkeletons = async (problemId: string) => {
  const response = await api.get<Record<string, string>>(
    `/problems/${problemId}/skeletons`,
  );

  return response.data;
};

const getProblemTemplates = async (problemId: string) => {
  const response = await api.get<Record<string, string>>(
    `/problems/${problemId}/templates`,
  );

  return response.data;
};

const deleteSkeleton = async (problemId: string, language: string) => {
  const response = await api.delete<{}>(
    `/problems/${problemId}/skeletons/${language}`,
  );

  return response.data;
};

const updateSkeleton = async (
  problemId: string,
  language: string,
  skeleton: string,
) => {
  const response = await api.put<{}>(
    `/problems/${problemId}/skeletons/${language}`,
    { skeleton },
  );

  return response.data;
};

const updateTemplate = async (
  problemId: string,
  language: string,
  template: string,
) => {
  const response = await api.put<{}>(
    `/problems/${problemId}/templates/${language}`,
    {template}
  );

  return response.data;
};

const updateTestSuite = async (
  problemId: string,
  testSuite: ITestSuite
) => {
  const response = await api.put<{}>(
    `/problems/${problemId}/tests`,
    {tests: testSuite}
  )

  return response.data;
}

const deleteSolutionTemplate = async (problemId: string, language: string) => {
  const response = await api.delete<{}>(
    `/problems/${problemId}/templates/${language}`,
  );

  return response.data;
};

const deleteProblem = async (problemId: string) => {
  const response = await api.delete<{}>(`/problems/${problemId}`);

  return response;
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
  getAllTests,
  createSkeleton,
  createTemplate,
  getTemplate,
  getProblemSkeletons,
  getProblemTemplates,
  deleteSkeleton,
  deleteSolutionTemplate,
  deleteProblem,
  updateSkeleton,
  updateTemplate,
  updateTestSuite
};
