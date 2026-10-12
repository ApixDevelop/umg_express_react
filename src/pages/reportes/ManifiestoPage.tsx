import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportesApi } from "@/api/reportes";
import { vehiculosApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatWeight, formatVolume } from "@/lib/utils";
import type { ManifiestoInfo } from "@/types";

export function ManifiestoPage() {
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<number>(0);

  const { data: vehiculos = [] } = useQuery({
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
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text">Manifiesto de carga</h1>
        {manifiesto && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="no-print"
          >
            Imprimir manifiesto
          </Button>
        )}
      </div>

      {/* Selector de vehículo */}
      <div className="rounded-panel border border-border bg-surface p-3 no-print max-w-sm">
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
        <div className="rounded-panel border border-border bg-surface p-6 text-center text-[13px] text-text-muted no-print">
          Seleccione una unidad vehicular para generar su manifiesto de carga.
        </div>
      ) : loadingManifiesto ? (
        <div className="rounded-panel border border-border bg-surface p-6 text-center text-[13px] text-text-muted">
          Cargando manifiesto de carga...
        </div>
      ) : isError ? (
        <div className="rounded-panel border border-border bg-surface p-6 text-center text-[13px] text-danger">
          {(error as any)?.message || "No fue posible generar el manifiesto para este vehículo."}
        </div>
      ) : manifiesto ? (
        <div className="rounded-panel border border-border bg-surface p-4 space-y-4 print:bg-white print:text-black print:border-none print-container">
          {/* Encabezado del documento */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
            <div>
              <div className="text-[12px] text-accent font-medium">UMG Express · Manifiesto de carga</div>
              <h2 className="text-[16px] font-semibold text-text">
                Vehículo {manifiesto.vehiculo.placa} ({manifiesto.vehiculo.marcaModelo})
              </h2>
            </div>
            <div className="text-[12px] text-text-muted space-y-0.5 sm:text-right">
              <p>Piloto: <span className="text-text">{manifiesto.piloto?.nombre || "No asignado"}</span></p>
              <p>
                Ruta: <span className="text-text">
                  {manifiesto.ruta?.sucursalOrigen?.nombre || "Origen"} → {manifiesto.ruta?.sucursalDestino?.nombre || "Destino"}
                </span>
              </p>
            </div>
          </div>

          {/* Tabla densa con totales al pie */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">No. guía</th>
                  <th className="py-2 px-3 font-medium">Remitente</th>
                  <th className="py-2 px-3 font-medium">Destinatario</th>
                  <th className="py-2 px-3 text-right font-medium">Peso (kg)</th>
                  <th className="py-2 px-3 text-right font-medium">Volumen (m³)</th>
                  <th className="py-2 px-3 text-right font-medium">Flete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {manifiesto.guias.map((g) => (
                  <tr key={g.numeroGuia} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text tabular-nums">
                      {g.numeroGuia}
                    </td>
                    <td className="py-2 px-3 text-text">
                      {g.remitente?.nombre || "-"}
                    </td>
                    <td className="py-2 px-3 text-text">
                      {g.destinatario?.nombre || "-"}
                    </td>
                    <td className="py-2 px-3 text-right text-text tabular-nums">
                      {formatWeight(g.pesoFacturableKg)}
                    </td>
                    <td className="py-2 px-3 text-right text-text-muted tabular-nums">
                      {formatVolume(g.volumenM3)}
                    </td>
                    <td className="py-2 px-3 text-right text-text tabular-nums font-medium">
                      {formatCurrency(g.costoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-surface-hover text-text font-medium text-[13px]">
                <tr>
                  <td className="py-2 px-3" colSpan={3}>
                    Totales ({manifiesto.resumen.totalGuias} paquetes)
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums">
                    {formatWeight(manifiesto.resumen.pesoTotalKg)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums">
                    {formatVolume(manifiesto.resumen.volumenTotalM3)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums font-semibold text-accent">
                    {formatCurrency(totalFlete)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Firmas para impresión */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[12px] text-text-muted no-screen print:grid">
            <div className="border-t border-border-input pt-2">
              Firma del piloto responsable
            </div>
            <div className="border-t border-border-input pt-2">
              Firma y sello de despacho
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}