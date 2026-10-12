import { api } from "./client";
import type { LoginResponse, Usuario, UserRole, ApiHealthResponse } from "@/types";

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login", { username, password });
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      // client logout interceptor or local cleanup
    }
  },

  async getMe(): Promise<Usuario> {
    const res = await api.get<{ success: boolean; user: Usuario }>("/auth/me");
    return res.data.user;
  },

  async crearUsuario(data: {
    username: string;
    password: string;
    nombre: string;
    rol: UserRole;
  }): Promise<Usuario> {
    const res = await api.post<{ success: boolean; usuario: Usuario }>("/auth/usuarios", data);
    return res.data.usuario;
  },

  async getHealth(): Promise<ApiHealthResponse> {
    const res = await api.get<ApiHealthResponse>("/health");
    return res.data;
  },
};
