import { useCallback } from "react";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  const login = useCallback(
      async (email, password) => {
        const data = await authApi.login({ email, password });
        setAuth(data.user, data.token);
        return data;
      },
      [setAuth]
  );

  const register = useCallback(
      async (username, email, password) => {
        const data = await authApi.register({ username, email, password });
        setAuth(data.user, data.token);
        return data;
      },
      [setAuth]
  );

  const loginWithGoogle = useCallback(
      async (idToken) => {
        const data = await authApi.googleLogin(idToken);
        setAuth(data.user, data.token);
        return data;
      },
      [setAuth]
  );

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
  };
}