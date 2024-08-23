export enum Language {
  JavaScript = "javascript",
  Python = "python",
  Typescript = "typescript",
}

interface ILanguageData {
  skeletonTemplate: string;
}

const JAVASCRIPT_SKELETON_TEMPLATE = `
function solution(args) {
  // return problemName(...args)
}
`;

const PYTHON_SKELETON_TEMPLATE = `
def solution(args):
  # return problemName(*args)
`;

const TYPESCRIPT_SKELETON_TEMPLATE = `
interface Value {
  type: string;
  value: string;
}

function solution(args: Record<string, Value>): any {
  // return problemName(...args)
}
`;


export const SUPPORTED_LANGUAGES: Record<Language, ILanguageData> = {
  [Language.JavaScript]: {
    skeletonTemplate: JAVASCRIPT_SKELETON_TEMPLATE,
  },
  [Language.Python]: {
    skeletonTemplate: PYTHON_SKELETON_TEMPLATE,
  },
  [Language.Typescript]: {
    skeletonTemplate: TYPESCRIPT_SKELETON_TEMPLATE,
  },
} as const;

export const getLanguageData = (
  language?: string,
): ILanguageData | undefined => {
  const data = SUPPORTED_LANGUAGES[language as Language];

  return data;
};
