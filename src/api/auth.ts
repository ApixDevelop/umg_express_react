import { api } from "./client";
import type { LoginResponse, Usuario, UserRole, ApiHealthResponse } from "@/types";

export interface CrearUsuarioPayload {
  username: string;
  password: string;
  nombre: string;
  rol: UserRole;
}

export interface ActualizarUsuarioPayload {
  username: string;
  nombre: string;
  rol: UserRole;
  password?: string;
}

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

  /**
   * Listar todos los usuarios activos del sistema (Solo Administrador)
   * GET /v1/auth/usuarios
   */
  async listarUsuarios(): Promise<Usuario[]> {
    const res = await api.get<{ success: boolean; usuarios: Usuario[] }>("/auth/usuarios");
    return res.data.usuarios || [];
  },

  /**
   * Obtener detalle de usuario por ID (Solo Administrador)
   * GET /v1/auth/usuarios/{id}
   */
  async obtenerUsuario(id: number): Promise<Usuario> {
    const res = await api.get<{ success: boolean; usuario: Usuario }>(`/auth/usuarios/${id}`);
    return res.data.usuario;
  },

  /**
   * Crear nuevo usuario de acceso
   * POST /v1/auth/usuarios
   */
  async crearUsuario(data: CrearUsuarioPayload): Promise<Usuario> {
    const res = await api.post<{ success: boolean; usuario: Usuario }>("/auth/usuarios", data);
    return res.data.usuario;
  },

  /**
   * Actualizar credenciales y rol de usuario existente (Solo Administrador)
   * PUT /v1/auth/usuarios/{id}
   */
  async actualizarUsuario(id: number, data: ActualizarUsuarioPayload): Promise<Usuario> {
    const res = await api.put<{ success: boolean; mensaje: string; usuario: Usuario }>(
      `/auth/usuarios/${id}`,
      data
    );
    return res.data.usuario;
  },

  /**
   * Baja lógica de usuario en el sistema (Solo Administrador)
   * DELETE /v1/auth/usuarios/{id}
   */
  async eliminarUsuario(id: number): Promise<void> {
    await api.delete<{ success: boolean; mensaje: string }>(`/auth/usuarios/${id}`);
  },

  async getHealth(): Promise<ApiHealthResponse> {
    const res = await api.get<ApiHealthResponse>("/health");
    return res.data;
  },
};
