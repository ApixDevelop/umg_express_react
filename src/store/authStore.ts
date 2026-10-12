import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Usuario } from "@/types";

interface AuthState {
  token: string | null;
  user: Usuario | null;
  setAuth: (token: string, user: Usuario) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token: string, user: Usuario) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null });
      },
      isAuthenticated: () => Boolean(get().token && get().user),
    }),
    {
      name: "umg_express_auth",
    }
  )
);
