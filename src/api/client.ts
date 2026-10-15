import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

/**
 * Obtiene y normaliza la URL base de la API según las variables de entorno.
 * Permite alternar limpiamente entre Producción (Render) y Desarrollo (Local/WSL).
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || "").trim();

  // Si no está definida o está vacía, usamos el proxy de Vite "/v1"
  if (!envUrl) {
    return "/v1";
  }

  // Si apunta expresamente a localhost o 127.0.0.1, usamos "/v1" para que el proxy
  // inverso de Vite gestione la solicitud server-to-server y elimine bloqueos de CORS.
  if (
    envUrl.includes("127.0.0.1:18080") ||
    envUrl.includes("localhost:18080") ||
    envUrl === "/v1"
  ) {
    return "/v1";
  }

  // Si es una URL externa (como Render), normalizamos asegurando que termine con /v1
  const clean = envUrl.replace(/\/+$/, "");
  return clean.endsWith("/v1") ? clean : `${clean}/v1`;
}

/**
 * Información contextual del backend activo para telemetría en UI
 */
export function getBackendInfo() {
  const envUrl = (import.meta.env.VITE_API_URL || "").trim();
  const isRender = envUrl.includes("onrender.com");
  const isLocal = !envUrl || envUrl.includes("127.0.0.1") || envUrl.includes("localhost") || envUrl === "/v1";

  return {
    isProduction: isRender,
    label: isRender ? "Render Cloud" : "Local C++ (18080)",
    shortLabel: isRender ? "Prod (Render)" : "Dev (Local)",
    rawUrl: envUrl || "/v1 (proxy)",
  };
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos de margen para cold-starts de Render
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; mensaje?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      // Si el token es inválido o expiró
      const currentToken = useAuthStore.getState().token;
      if (currentToken && !error.config?.url?.includes("/auth/login")) {
        useAuthStore.getState().logout();
      }
    }

    const message =
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      error.message ||
      "Ocurrió un error inesperado al comunicarse con el servidor";

    return Promise.reject(new Error(message));
  }
);
