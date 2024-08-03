import { User } from "@/lib/types";
import { atom } from "jotai";

export interface AuthState {
  user: User | null;
}

export const authAtom = atom<AuthState>({
  user: null,
});
