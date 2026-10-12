import { api } from "./client";
import type { DespachoItem, ResultadoDespacho } from "@/types";

export interface ProcesarDespachoPayload {
  idVehiculo: number;
  idPiloto?: number;
  guias: number[];
}

export const despachoApi = {
  async listar(): Promise<DespachoItem[]> {
    const res = await api.get<{ success: boolean; despachos: DespachoItem[] }>("/transacciones/despacho");
    return res.data.despachos || [];
  },

  async procesar(data: ProcesarDespachoPayload): Promise<ResultadoDespacho> {
    const res = await api.post<{ success: boolean; despacho: ResultadoDespacho }>("/transacciones/despacho", data);
    return res.data.despacho;
  },
};
