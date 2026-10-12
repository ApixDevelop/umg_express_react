import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { guiasApi } from "@/api/guias";
import { vehiculosApi } from "@/api/catalogos";
import { reportesApi } from "@/api/reportes";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import type { Vehiculo } from "@/types";

export function DashboardPage() {
  const { data: guias = [], isLoading: loadingGuias } = useQuery({
    queryKey: ["guias"],
    queryFn: () => guiasApi.listar(),
  });

  const { data: vehiculos = [], isLoading: loadingVehiculos } = useQuery({
    queryKey: ["vehiculos"],
    queryFn: () => vehiculosApi.listar(),
  });

  const { data: liquidacion } = useQuery({
    queryKey: ["liquidacion"],
    queryFn: () => reportesApi.obtenerLiquidacion(),
  });

  // KPI Metrics
  const totalGuias = guias.length;
  const enBodega = guias.filter((g) => g.estado === "Creada").length;
  const enTransito = guias.filter((g) => g.estado === "Despachada").length;
  const entregadas = guias.filter((g) => g.estado === "Entregada").length;
  const totalFacturado =
    liquidacion?.resumenFinanciero?.importeTotalFacturado ||
    guias.reduce((acc, g) => acc + (g.costoTotal || 0), 0);

  const vehiculosDisponibles = vehiculos.filter((v) => v.estado === "Disponible").length;

  return (
    <div className="space-y-4">
      {/* Cabecera de página */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link to="/despacho">
            <Button variant="secondary" size="sm">
              Despachar
            </Button>
          </Link>
          <Link to="/guias">
            <Button variant="primary" size="sm">
              Nueva guía
            </Button>
          </Link>
        </div>
      </div>

      {/* Franja de KPIs en un solo panel continuo */}
      <div className="rounded-panel border border-border bg-surface grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="p-4 space-y-1">
          <div className="text-[12px] font-normal text-text-muted">Guías</div>
          <div className="text-[24px] font-semibold text-text tabular-nums leading-none">
            {totalGuias}
          </div>
          <div className="text-[12px] text-text-faint">{entregadas} entregadas</div>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-[12px] font-normal text-text-muted">En bodega</div>
          <div className="text-[24px] font-semibold text-text tabular-nums leading-none">
            {enBodega}
          </div>
          <div className="text-[12px] text-text-faint">pendientes</div>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-[12px] font-normal text-text-muted">En tránsito</div>
          <div className="text-[24px] font-semibold text-text tabular-nums leading-none">
            {enTransito}
          </div>
          <div className="text-[12px] text-text-faint">en vehículos</div>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-[12px] font-normal text-text-muted">Facturado</div>
          <div className="text-[24px] font-semibold text-text tabular-nums leading-none">
            {formatCurrency(totalFacturado)}
          </div>
          <div className="text-[12px] text-text-faint">&nbsp;</div>
        </div>
      </div>

      {/* Distribución 2/3 y 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Guías recientes (2 columnas) */}
        <div className="lg:col-span-2 rounded-panel border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-[16px] font-semibold text-text">Guías recientes</h2>
            <Link
              to="/guias"
              className="text-[13px] text-text-muted hover:text-text transition-colors"
            >
              Ver todas
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loadingGuias ? (
              <div className="p-6 text-center text-text-muted text-[13px]">Cargando guías...</div>
            ) : guias.length === 0 ? (
              <div className="p-6 text-center text-text-muted text-[13px]">
                No hay guías registradas en el sistema.
              </div>
            ) : (
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                    <th className="py-2 px-3 font-medium">No. guía</th>
                    <th className="py-2 px-3 text-right font-medium">Peso (kg)</th>
                    <th className="py-2 px-3 text-right font-medium">Costo</th>
                    <th className="py-2 px-3 font-medium">Estado</th>
                    <th className="py-2 px-3 text-right font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {guias.slice(-5).reverse().map((g) => (
                    <tr key={g.numeroGuia} className="hover:bg-surface-hover transition-colors h-10">
                      <td className="py-2 px-3">
                        <Link
                          to={`/rastreo?no=${g.numeroGuia}`}
                          className="text-text hover:underline tabular-nums"
                        >
                          {g.numeroGuia}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-right text-text tabular-nums">
                        {formatWeight(g.pesoFacturableKg)}
                      </td>
                      <td className="py-2 px-3 text-right text-text tabular-nums">
                        {formatCurrency(g.costoTotal)}
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={g.estado} />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link
                          to={`/rastreo?no=${g.numeroGuia}`}
                          className="text-[13px] text-accent hover:underline"
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

        {/* Flota (1 columna) */}
        <div className="rounded-panel border border-border bg-surface flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-[16px] font-semibold text-text">Flota</h2>
              <p className="text-[12px] text-text-muted">
                {vehiculosDisponibles} de {vehiculos.length} disponibles
              </p>
            </div>
            <Link
              to="/catalogos/vehiculos"
              className="text-[13px] text-text-muted hover:text-text transition-colors"
            >
              Gestionar
            </Link>
          </div>

          <div className="p-3 flex-1">
            {loadingVehiculos ? (
              <div className="p-4 text-center text-text-muted text-[13px]">Cargando flota...</div>
            ) : vehiculos.length === 0 ? (
              <div className="p-4 text-center text-[13px] space-y-1">
                <p className="text-text-muted">No hay vehículos registrados.</p>
                <Link
                  to="/catalogos/vehiculos"
                  className="text-accent hover:underline block text-[13px]"
                >
                  Registrar vehículo
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {vehiculos.slice(0, 5).map((v: Vehiculo) => (
                  <div
                    key={v.id}
                    className="py-2 flex items-center justify-between text-[13px]"
                  >
                    <div>
                      <p className="text-text font-medium">{v.placa}</p>
                      <p className="text-[12px] text-text-muted truncate max-w-[130px]">{v.marcaModelo}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={v.estado} />
                      <p className="text-[11px] text-text-faint tabular-nums mt-0.5">
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