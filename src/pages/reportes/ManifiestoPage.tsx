import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportesApi } from "@/api/reportes";
import { vehiculosApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatWeight, formatVolume } from "@/lib/utils";
import { Printer } from "lucide-react";
import type { ManifiestoInfo } from "@/types";

export function ManifiestoPage() {
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<number>(0);

  const { data: vehiculos = [], isLoading: loadingVehiculos } = useQuery({
    queryKey: ["vehiculos"],
    queryFn: () => vehiculosApi.listar(),
  });

  const {
    data: manifiesto,
    isLoading: loadingManifiesto,
    isError,
    error,
  } = useQuery<ManifiestoInfo>({
    queryKey: ["manifiesto", selectedVehiculoId],
    queryFn: () => reportesApi.obtenerManifiesto(Number(selectedVehiculoId)),
    enabled: selectedVehiculoId > 0,
    retry: false,
  });

  const totalFlete = manifiesto?.guias.reduce((acc, g) => acc + (g.costoTotal || 0), 0) || 0;

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Manifiesto de Carga</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Relación de paquetes despachados por unidad vehicular y piloto responsable
          </p>
        </div>
        {manifiesto && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="no-print text-xs"
          >
            Imprimir manifiesto
          </Button>
        )}
      </div>

      {/* Selector de vehículo */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-3 no-print max-w-md">
        <Select
          label="Unidad vehicular"
          value={selectedVehiculoId}
          onChange={(e) => setSelectedVehiculoId(Number(e.target.value))}
        >
          <option value="0">-- Seleccione vehículo --</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} - {v.marcaModelo} ({v.estado})
            </option>
          ))}
        </Select>
      </div>

      {/* Manifiesto */}
      {selectedVehiculoId === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-8 text-center text-xs text-slate-400 no-print">
          Seleccione una unidad vehicular para generar su manifiesto de carga.
        </div>
      ) : loadingManifiesto ? (
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-8 text-center text-xs text-slate-500">
          Cargando manifiesto de carga...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-6 text-center text-xs text-rose-400">
          {(error as any)?.message || "No fue posible generar el manifiesto para este vehículo."}
        </div>
      ) : manifiesto ? (
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-5 space-y-4 print:bg-white print:text-black print:border-none print-container">
          {/* Encabezado del documento */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <div className="text-xs text-amber-500 font-medium">UMG Express · Manifiesto de Carga</div>
              <h2 className="text-base font-semibold text-slate-100">
                Vehículo {manifiesto.vehiculo.placa} ({manifiesto.vehiculo.marcaModelo})
              </h2>
            </div>
            <div className="text-xs text-slate-400 space-y-0.5 sm:text-right">
              <p>Piloto: <span className="text-slate-200">{manifiesto.piloto?.nombre || "No asignado"}</span></p>
              <p>
                Ruta: <span className="text-slate-200">
                  {manifiesto.ruta?.sucursalOrigen?.nombre || "Origen"} → {manifiesto.ruta?.sucursalDestino?.nombre || "Destino"}
                </span>
              </p>
            </div>
          </div>

          {/* Tabla densa con totales al pie */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2.5 px-3">No. guía</th>
                  <th className="py-2.5 px-3">Remitente</th>
                  <th className="py-2.5 px-3">Destinatario</th>
                  <th className="py-2.5 px-3 text-right">Peso fact.</th>
                  <th className="py-2.5 px-3 text-right">Volumen</th>
                  <th className="py-2.5 px-3 text-right">Flete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {manifiesto.guias.map((g) => (
                  <tr key={g.numeroGuia} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 font-mono font-medium text-slate-200">
                      {g.numeroGuia}
                    </td>
                    <td className="py-2 px-3 text-slate-300">
                      {g.remitente?.nombre || "-"}
                    </td>
                    <td className="py-2 px-3 text-slate-300">
                      {g.destinatario?.nombre || "-"}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">
                      {formatWeight(g.pesoFacturableKg)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                      {formatVolume(g.volumenM3)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200 font-medium tabular-nums">
                      {formatCurrency(g.costoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-800 bg-slate-900/70 text-slate-200 font-medium text-xs">
                <tr>
                  <td className="py-2.5 px-3" colSpan={3}>
                    Totales ({manifiesto.resumen.totalGuias} paquetes)
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {formatWeight(manifiesto.resumen.pesoTotalKg)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {formatVolume(manifiesto.resumen.volumenTotalM3)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-amber-500">
                    {formatCurrency(totalFlete)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Firmas para impresión */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-400 no-screen print:grid">
            <div className="border-t border-slate-700 pt-2">
              Firma del piloto responsable
            </div>
            <div className="border-t border-slate-700 pt-2">
              Firma y sello de despacho
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
