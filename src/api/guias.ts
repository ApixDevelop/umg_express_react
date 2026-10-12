import { api } from "./client";
import type { Guia } from "@/types";

export interface CrearGuiaPayload {
  idClienteRemitente: number;
  idClienteDestinatario: number;
  idRuta: number;
  pesoRealKg: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  idTarifa?: number;
  tipoCarga?: string;
}

export const guiasApi = {
  async listar(): Promise<Guia[]> {
    const res = await api.get<{ success: boolean; guias: Guia[] }>("/transacciones/guias");
    return res.data.guias || [];
  },

  async obtener(numeroGuia: number): Promise<Guia> {
    const res = await api.get<{ success: boolean; guia: Guia }>(`/transacciones/guias/${numeroGuia}`);
    return res.data.guia;
  },

  async crear(data: CrearGuiaPayload): Promise<Guia> {
    const res = await api.post<{ success: boolean; guia: Guia }>("/transacciones/guias", data);
    return res.data.guia;
  },
};
