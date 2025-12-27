import { create } from "zustand";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  accountInfo: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("xyz_to_ken"),
  isAuthenticated: !!localStorage.getItem("xyz_to_ken"),
  accountInfo: null,

  setAuth: (token, user) => {
    localStorage.setItem("xyz_to_ken", token);
    set({ token, isAuthenticated: true, accountInfo: user });
  },

  logout: () => {
    localStorage.removeItem("xyz_to_ken");
    set({ token: null, isAuthenticated: false, accountInfo: null });
    window.location.href = "/login";
  },
}));
