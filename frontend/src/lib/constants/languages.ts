export enum Language {
  JavaScript = "javascript",
  Python = "python",
  Typescript = "typescript",
  Java = "java",
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
function solution(args: Record<string, any>): any {
  // return problemName(...args)
}
`;

const JAVA_SKELETON_TEMPLATE = `
class Submission {
  // determine return type from the problem
  public static Object run(Map<String, Object> args) {
    // DON'T FORGET TO CASE THE OBJECT
  }
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
  [Language.Java]: {
    skeletonTemplate: JAVA_SKELETON_TEMPLATE,
  },
} as const;

export const getLanguageData = (
  language?: string,
): ILanguageData | undefined => {
  const data = SUPPORTED_LANGUAGES[language as Language];

  return data;
};
