import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setAuth(data.user, data.token);
    return data;
  };

  const register = async (username, email, password) => {
    const data = await authApi.register({ username, email, password });
    setAuth(data.user, data.token);
    return data;
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
  };
}