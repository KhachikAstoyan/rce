import { api } from "@/lib/api";
import { User } from "@/lib/types";

const getUserInfo = async () => {
  return api.get<User>("/users/me");
};

const getRefreshToken = async () => {
  return api.post("/auth/refreshtoken");
};

const logOut = async () => {
  const res = await api.post("/auth/logout");
  localStorage.removeItem("accessToken");

  return res;
};

export const authService = { getUserInfo, logOut, getRefreshToken };
