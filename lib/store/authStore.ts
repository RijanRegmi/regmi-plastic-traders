import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function eraseCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// The axios interceptor in api/index.ts reads localStorage.getItem('token').
// Zustand persist uses key 'rpt-admin-auth' (a nested object), so the
// interceptor never finds the token. Fix: also write to the 'token' key directly.
function writeTokenLS(token: string) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("token", token);
}

function clearTokenLS() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        setCookie("rpt_admin_token", token, 7); // middleware route guard
        writeTokenLS(token);                    // axios interceptor
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        eraseCookie("rpt_admin_token");
        clearTokenLS();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "rpt-admin-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // On page reload, re-sync both storage locations from persisted Zustand state
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setCookie("rpt_admin_token", state.token, 7);
          writeTokenLS(state.token);
        }
      },
    },
  ),
);