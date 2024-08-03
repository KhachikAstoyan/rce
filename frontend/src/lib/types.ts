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
