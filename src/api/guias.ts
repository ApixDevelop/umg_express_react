import { api } from "./client";
import type { Guia, EstadoGuia } from "@/types";

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
    const res = await api.get<{ success: boolean; guia: Guia }>("/transacciones/guias/" + numeroGuia);
    return res.data.guia;
  },

  async crear(data: CrearGuiaPayload): Promise<Guia> {
    const res = await api.post<{ success: boolean; guia: Guia }>("/transacciones/guias", data);
    return res.data.guia;
  },

  /** Actualiza el estado operativo de una guía (Creada, Despachada, Entregada) */
  async actualizarEstado(numeroGuia: number, estado: EstadoGuia): Promise<Guia> {
    const res = await api.put<{ success: boolean; mensaje: string; guia: Guia }>(
      "/transacciones/guias/" + numeroGuia,
      { estado }
    );
    return res.data.guia;
  },

  /** Marca una guía como entregada directamente */
  async marcarEntregada(numeroGuia: number): Promise<Guia> {
    const res = await api.post<{ success: boolean; mensaje: string; guia: Guia }>(
      "/transacciones/guias/" + numeroGuia + "/entregar"
    );
    return res.data.guia;
  },
};
