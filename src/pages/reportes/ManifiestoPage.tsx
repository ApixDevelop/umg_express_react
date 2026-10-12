import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportesApi } from "@/api/reportes";
import { vehiculosApi } from "@/api/catalogos";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatWeight, formatVolume } from "@/lib/utils";
import { Truck, Printer, FileText, User, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Manifiesto de Carga por Vehículo
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reporte consolidado de paquetes asignados, piloto responsable y fletes por unidad de transporte.
          </p>
        </div>
        {manifiesto && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
            className="no-print"
          >
            Imprimir Manifiesto
          </Button>
        )}
      </div>

      {/* Vehicle Selection Card */}
      <Card className="p-6 no-print">
        <div className="max-w-md">
          <Select
            label="Seleccionar Unidad Vehicular"
            value={selectedVehiculoId}
            onChange={(e) => setSelectedVehiculoId(Number(e.target.value))}
          >
            <option value="0">-- Seleccione una unidad vehicular --</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.marcaModelo} ({v.estado})
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Manifest Presentation */}
      {selectedVehiculoId === 0 ? (
        <Card className="p-12 text-center text-slate-500 space-y-2 no-print">
          <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-slate-300">Seleccione un vehículo para generar su manifiesto</p>
          <p className="text-xs text-slate-500">Se listarán todas las guías despachadas activas asignadas a la unidad.</p>
        </Card>
      ) : loadingManifiesto ? (
        <div className="p-12 text-center text-slate-500 text-sm">Generando manifiesto de carga...</div>
      ) : isError ? (
        <Card className="p-8 text-center text-rose-400 text-sm space-y-1">
          <p className="font-bold">No fue posible generar el manifiesto</p>
          <p className="text-xs text-slate-400">{(error as any)?.message || "Vehículo sin despacho o no encontrado"}</p>
        </Card>
      ) : manifiesto ? (
        <div className="space-y-6">
          {/* Manifest Document Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 shadow-2xl font-mono text-xs border border-slate-300 space-y-6 print-container">
            {/* Header Document */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-600 block">
                  TRANSPORTE Y LOGÍSTICA
                </span>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">
                  UMG EXPRESS — MANIFIESTO DE CARGA
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Documento Oficial de Despacho y Custodia
                </p>
              </div>
              <div className="text-right sm:text-right">
                <div className="text-sm font-bold">VEHÍCULO: {manifiesto.vehiculo.placa}</div>
                <div className="text-xs text-slate-600">{manifiesto.vehiculo.marcaModelo}</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200">
                  ESTADO: {manifiesto.vehiculo.estado.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Transport details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">PILOTO / CONDUCTOR</span>
                {manifiesto.piloto ? (
                  <div>
                    <strong className="text-sm block">{manifiesto.piloto.nombre}</strong>
                    <span className="text-slate-600">Licencia: {manifiesto.piloto.licencia}</span> ·{" "}
                    <span className="text-slate-600">Tel: {manifiesto.piloto.telefono}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">Sin piloto registrado</span>
                )}
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">TRAYECTO DE LA RUTA</span>
                {manifiesto.ruta ? (
                  <div>
                    <strong className="text-sm block">
                      {manifiesto.ruta.sucursalOrigen?.nombre || "Origen"} →{" "}
                      {manifiesto.ruta.sucursalDestino?.nombre || "Destino"}
                    </strong>
                    <span className="text-slate-600">
                      Ruta ID #{manifiesto.ruta.id}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">Ruta interdepartamental general</span>
                )}
              </div>
            </div>

            {/* Cargo totals bar */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 grid grid-cols-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">TOTAL PAQUETES</span>
                <span className="text-lg font-black text-slate-900">{manifiesto.resumen.totalGuias}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">PESO ACUMULADO</span>
                <span className="text-lg font-black text-slate-900">
                  {formatWeight(manifiesto.resumen.pesoTotalKg)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">VOLUMEN ACUMULADO</span>
                <span className="text-lg font-black text-slate-900">
                  {formatVolume(manifiesto.resumen.volumenTotalM3)}
                </span>
              </div>
            </div>

            {/* Guides Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-700 uppercase text-[10px] font-black">
                    <th className="py-2 px-2">No. Guía</th>
                    <th className="py-2 px-2">Remitente</th>
                    <th className="py-2 px-2">Destinatario</th>
                    <th className="py-2 px-2">Peso Fact.</th>
                    <th className="py-2 px-2">Volumen</th>
                    <th className="py-2 px-2 text-right">Flete Cobrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {manifiesto.guias.map((g) => (
                    <tr key={g.numeroGuia} className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-950">#{g.numeroGuia}</td>
                      <td className="py-2 px-2 text-slate-800">{g.remitente?.nombre || "—"}</td>
                      <td className="py-2 px-2 text-slate-800">{g.destinatario?.nombre || "—"}</td>
                      <td className="py-2 px-2 text-slate-900">{formatWeight(g.pesoFacturableKg)}</td>
                      <td className="py-2 px-2 text-slate-600">{formatVolume(g.volumenM3)}</td>
                      <td className="py-2 px-2 text-right font-bold text-slate-950">
                        {formatCurrency(g.costoTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures footer */}
            <div className="pt-12 grid grid-cols-2 gap-12 text-center text-[10px]">
              <div className="border-t border-slate-400 pt-2">
                Firma y Nombre del Piloto Encargado
              </div>
              <div className="border-t border-slate-400 pt-2">
                Firma y Sello de Despacho en Bodega
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
