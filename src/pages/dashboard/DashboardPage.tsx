import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { guiasApi } from "@/api/guias";
import { vehiculosApi } from "@/api/catalogos";
import { reportesApi } from "@/api/reportes";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { Plus, Truck } from "lucide-react";
import type { Guia, Vehiculo } from "@/types";

export function DashboardPage() {
  const { data: guias = [], isLoading: loadingGuias } = useQuery<Guia[]>({
    queryKey: ["guias"],
    queryFn: () => guiasApi.listar(),
  });

  const { data: vehiculos = [], isLoading: loadingVehiculos } = useQuery<Vehiculo[]>({
    queryKey: ["vehiculos"],
    queryFn: () => vehiculosApi.listar(),
  });

  const { data: liquidacion } = useQuery({
    queryKey: ["liquidacion"],
    queryFn: () => reportesApi.obtenerLiquidacion(),
    retry: false,
  });

  const totalGuias = guias.length;
  const enBodega = guias.filter((g) => g.estado === "Creada").length;
  const enTransito = guias.filter((g) => g.estado === "Despachada").length;
  const entregadas = guias.filter((g) => g.estado === "Entregada").length;

  const totalFacturado =
    liquidacion?.resumenFinanciero?.importeTotalFacturado ??
    guias.reduce((acc, curr) => acc + (curr.costoTotal || 0), 0);

  const vehiculosDisponibles = vehiculos.filter((v: Vehiculo) => v.estado === "Disponible").length;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Cabecera de página */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100 font-heading">
          Dashboard
        </h1>

        <div className="flex items-center gap-2">
          <Link to="/despacho">
            <Button variant="secondary" size="md">
              Despachar
            </Button>
          </Link>
          <Link to="/guias">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Nueva guía
            </Button>
          </Link>
        </div>
      </div>

      {/* Franja KPI unificada */}
      <div className="rounded-xl border border-slate-800 bg-[#0c1220] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
        {/* Guías */}
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-400 font-medium">Guías</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 tabular-nums">
            {totalGuias}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {entregadas} entregadas
          </p>
        </div>

        {/* En bodega */}
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-400 font-medium">En bodega</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 tabular-nums">
            {enBodega}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            pendientes
          </p>
        </div>

        {/* En tránsito */}
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-400 font-medium">En tránsito</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 tabular-nums">
            {enTransito}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            en vehículos
          </p>
        </div>

        {/* Facturado */}
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-400 font-medium">Facturado</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 tabular-nums">
            {formatCurrency(totalFacturado)}
          </p>
          <p className="text-xs text-slate-500 mt-1 opacity-0 select-none">
            —
          </p>
        </div>
      </div>

      {/* Distribución 2/3 y 1/3: Guías recientes y Flota */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Guías recientes (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0c1220] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">
              Guías recientes
            </h2>
            <Link
              to="/guias"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
            >
              Ver todas
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loadingGuias ? (
              <div className="p-8 text-center text-slate-500 text-xs">Cargando guías...</div>
            ) : guias.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <p className="text-xs text-slate-400">No hay guías registradas</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 text-[11px] font-medium">
                    <th className="py-2.5 px-4 font-medium">No. guía</th>
                    <th className="py-2.5 px-4 font-medium">Peso</th>
                    <th className="py-2.5 px-4 font-medium">Costo</th>
                    <th className="py-2.5 px-4 font-medium">Estado</th>
                    <th className="py-2.5 px-4 text-right font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {guias.slice(-5).reverse().map((g) => (
                    <tr key={g.numeroGuia} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-200">
                        {g.numeroGuia}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300 tabular-nums">
                        {formatWeight(g.pesoFacturableKg)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300 tabular-nums">
                        {formatCurrency(g.costoTotal)}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={g.estado} />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Link
                          to={`/rastreo?no=${g.numeroGuia}`}
                          className="text-xs text-amber-500 hover:text-amber-400 transition-colors font-medium"
                        >
                          Rastrear
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Flota (1 col) */}
        <div className="rounded-xl border border-slate-800 bg-[#0c1220] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                Flota
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {vehiculosDisponibles} de {vehiculos.length} disponibles
              </p>
            </div>
            <Link
              to="/catalogos/vehiculos"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
            >
              Gestionar
            </Link>
          </div>

          <div className="flex-1 p-4">
            {loadingVehiculos ? (
              <div className="p-6 text-center text-slate-500 text-xs">Cargando flota...</div>
            ) : vehiculos.length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  No hay vehículos registrados.
                </p>
                <Link
                  to="/catalogos/vehiculos"
                  className="inline-block text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Registrar vehículo
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {vehiculos.slice(0, 5).map((v: Vehiculo) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-mono font-medium text-slate-200">{v.placa}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{v.marcaModelo}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={v.estado} />
                      <p className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                        {v.capacidadPesoKg} kg / {v.capacidadVolumenM3} m³
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
