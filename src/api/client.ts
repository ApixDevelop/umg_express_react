import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: "/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
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
