import { Language } from "../types";

interface ILanguageData {
  name: string;
  skeletonTemplate: string;
}

const JAVASCRIPT_SKELETON_TEMPLATE = `
function solution(args) {
  // return problemName(...args)
}
`;

export const SUPPORTED_LANGUAGES: readonly ILanguageData[] = [
  {
    name: Language.JavaScript,
    skeletonTemplate: JAVASCRIPT_SKELETON_TEMPLATE,
  },
] as const;
