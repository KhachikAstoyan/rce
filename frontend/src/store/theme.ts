import { atom } from "jotai";
type theme = "light" | "dark" | "system";

export const themeAtom = atom<theme>(
  (localStorage.getItem("theme") as theme) || "dark",
);
