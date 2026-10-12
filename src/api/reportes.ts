import { api } from "./client";
import type { RastreoInfo, ManifiestoInfo, LiquidacionInfo } from "@/types";

export const reportesApi = {
  async obtenerRastreo(numeroGuia: number): Promise<RastreoInfo> {
    const res = await api.get<{ success: boolean; rastreo: RastreoInfo }>(`/reportes/rastreo/${numeroGuia}`);
    return res.data.rastreo;
  },

  async obtenerManifiesto(idVehiculo: number): Promise<ManifiestoInfo> {
    const res = await api.get<{ success: boolean; manifiesto: ManifiestoInfo }>(`/reportes/manifiesto/${idVehiculo}`);
    return res.data.manifiesto;
  },

  async obtenerLiquidacion(): Promise<LiquidacionInfo> {
    const res = await api.get<{ success: boolean; liquidacion: LiquidacionInfo }>("/reportes/liquidacion");
    return res.data.liquidacion;
  },
};
