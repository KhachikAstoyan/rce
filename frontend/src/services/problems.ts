import { api } from "@/lib/api";
import { Language, Problem } from "@/lib/types";

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
  const response = await api.post("/submissions", {
    solution: code,
    language,
    problemId,
  });

  return response;
};

export const problemService = {
  getProblems,
  createProblem,
  getProblemDetails,
  createSubmission,
};
