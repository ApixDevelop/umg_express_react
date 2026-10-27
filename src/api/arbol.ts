import { api } from "./client";
import type {
  ArbolMetricasResponse,
  ArbolInOrderResponse,
  ArbolBusquedaResponse,
  ArbolEstructuraResponse,
} from "@/types";

export const arbolApi = {
  /**
   * Obtener métricas estructurales del árbol BST y los 3 recorridos (In-Order, Pre-Order, Post-Order)
   * GET /v1/arbol/guias/metricas
   */
  async obtenerMetricas(): Promise<ArbolMetricasResponse> {
    const res = await api.get<ArbolMetricasResponse>("/arbol/guias/metricas");
    return res.data;
  },

  /**
   * Listado completo de guías ordenadas de menor a mayor mediante recorrido In-Order recursivo
   * GET /v1/arbol/guias/inorder
   */
  async obtenerInOrder(): Promise<ArbolInOrderResponse> {
    const res = await api.get<ArbolInOrderResponse>("/arbol/guias/inorder");
    return res.data;
  },

  /**
   * Búsqueda binaria recursiva O(log n) que contabiliza comparaciones realizadas
   * GET /v1/arbol/guias/buscar/{numeroGuia}
   */
  async buscarGuia(numeroGuia: number): Promise<ArbolBusquedaResponse> {
    const res = await api.get<ArbolBusquedaResponse>(`/arbol/guias/buscar/${numeroGuia}`);
    return res.data;
  },

  /**
   * Estructura jerárquica del árbol en formato JSON para renderizar gráficos de árbol
   * GET /v1/arbol/guias/estructura
   */
  async obtenerEstructura(): Promise<ArbolEstructuraResponse> {
    const res = await api.get<ArbolEstructuraResponse>("/arbol/guias/estructura");
    return res.data;
  },
};
