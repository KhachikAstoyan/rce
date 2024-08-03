import { authAtom } from "@/store/auth";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { authService } from "@/services/auth";

export function useAuth() {
  const [auth, setAuth] = useAtom(authAtom);
  const isLoggedIn = auth.user !== null;

  const getUserProfile = useCallback(async () => {
    try {
      const response = await authService.getUserInfo();
      setAuth({ user: response.data });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }, [setAuth]);

  useEffect(() => {
    if (!auth.user) {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("accessToken");

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        authService.getRefreshToken().then(() => {
          history.replaceState({}, document.title, window.location.pathname);
        });
      }
      
      getUserProfile();
    }
  }, []);

  const logOut = useCallback(async () => {
    try {
      await authService.logOut();
    } catch (error) {
      // TODO: add notification
      console.error("Failed to log out:", error);
    } finally {
      setAuth({ user: null });
      localStorage.removeItem("accessToken");
    }
  }, []);

  return {
    isLoggedIn,
    auth,
    setAuth,
    logOut,
  };
}
