import { useAuthStore } from "../store/auth.store";
import { ROLES } from "../constants/permissions";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const guestLogin = useAuthStore((state) => state.guestLogin);
  const logout = useAuthStore((state) => state.logout);
  const setRole = useAuthStore((state) => state.setRole);

  const isGM = user?.role === ROLES.GM;
  const isPlayer = user?.role === ROLES.PLAYER;

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    guestLogin,
    logout,
    setRole,
    isGM,
    isPlayer,
  };
}
