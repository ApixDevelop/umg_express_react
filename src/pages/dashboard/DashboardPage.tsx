import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { guiasApi } from "@/api/guias";
import { vehiculosApi } from "@/api/catalogos";
import { reportesApi } from "@/api/reportes";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import type { Vehiculo } from "@/types";
import {
  Package,
  Truck,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Boxes
} from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState("");

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

  // Telemetry Calculations
  const totalGuias = guias.length;
  const enBodega = guias.filter((g) => g.estado === "Creada").length;
  const enTransito = guias.filter((g) => g.estado === "Despachada").length;
  const entregadas = guias.filter((g) => g.estado === "Entregada").length;
  const totalFacturado =
    liquidacion?.resumenFinanciero?.importeTotalFacturado ||
    guias.reduce((acc, g) => acc + (g.costoTotal || 0), 0);

  const vehiculosDisponibles = vehiculos.filter((v) => v.estado === "Disponible").length;
  const vehiculosEnRuta = vehiculos.filter((v) => v.estado === "En ruta").length;

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    navigate(`/rastreo?no=${encodeURIComponent(quickSearch.trim())}`);
  };

  return (
    <div className="space-y-4">
      {/* Cabecera Principal y Barra de Rastreo Express */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-text tracking-tight">Centro de Control Logístico</h1>
            <Badge variant="success">En línea</Badge>
          </div>
          <p className="text-[13px] text-text-muted mt-0.5">
            Monitoreo en tiempo real de estiba, flota activa y flujo de paquetes.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          {/* Input de Búsqueda Rápida de Guía */}
          <form onSubmit={handleQuickSearchSubmit} className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Rastreo express #..."
              className="w-full h-8 bg-surface text-text text-[12px] rounded-control border border-border-input pl-8 pr-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </form>

          <Link to="/despacho">
            <Button variant="secondary" size="sm" className="gap-1.5 shadow-sm active:scale-[0.97]">
              <Truck className="w-3.5 h-3.5 text-accent" />
              <span>Despachar</span>
            </Button>
          </Link>
          <Link to="/guias">
            <Button variant="primary" size="sm" className="gap-1.5 shadow-sm active:scale-[0.97]">
              <Package className="w-3.5 h-3.5" />
              <span>Nueva guía</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Franja de KPIs de Telemetría (Glassmorphism sutil & Emil Kowalski physics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Guías */}
        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <span>Volumen Emitido</span>
            <div className="w-6 h-6 rounded bg-accent/10 text-accent flex items-center justify-center">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-mono font-bold text-[24px] text-text tracking-tight tabular-nums">
              {totalGuias}
            </div>
            <p className="text-[11px] text-ok flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>{entregadas} entregadas con éxito</span>
            </p>
          </div>
          <div className="text-[11px] text-text-faint font-mono pt-1 border-t border-border/50">
            {totalGuias > 0 ? ((entregadas / totalGuias) * 100).toFixed(0) : 0}% ratio de cumplimiento
          </div>
        </div>

        {/* KPI 2: En Bodega */}
        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between hover:border-warn/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <span>En Bahía / Bodega</span>
            <div className="w-6 h-6 rounded bg-warn/10 text-warn flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-mono font-bold text-[24px] text-text tracking-tight tabular-nums">
              {enBodega}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Pendientes de asignación a ruta
            </p>
          </div>
          <div className="text-[11px] text-accent font-medium pt-1 border-t border-border/50">
            <Link to="/despacho" className="hover:underline flex items-center gap-1">
              <span>Cargar a vehículo</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 3: En Tránsito */}
        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between hover:border-info/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <span>En Ruta / Tránsito</span>
            <div className="w-6 h-6 rounded bg-info/10 text-info flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-mono font-bold text-[24px] text-info tracking-tight tabular-nums">
              {enTransito}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              En {vehiculosEnRuta} unidades vehiculares
            </p>
          </div>
          <div className="text-[11px] text-text-faint font-mono pt-1 border-t border-border/50">
            Monitoreo activo por GPS
          </div>
        </div>

        {/* KPI 4: Total Facturado */}
        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between hover:border-ok/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <span>Facturación Total</span>
            <div className="w-6 h-6 rounded bg-ok/10 text-ok flex items-center justify-center font-bold">
              Q
            </div>
          </div>
          <div className="my-2">
            <div className="font-mono font-bold text-[24px] text-text tracking-tight tabular-nums">
              {formatCurrency(totalFacturado)}
            </div>
            <p className="text-[11px] text-ok flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Arqueo consolidado</span>
            </p>
          </div>
          <div className="text-[11px] text-accent font-medium pt-1 border-t border-border/50">
            <Link to="/reportes/liquidacion" className="hover:underline flex items-center gap-1">
              <span>Ver liquidación</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Central: 2 Columnas Recientes + 1 Columna Flota */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Guías Recientes (2 columnas) */}
        <div className="lg:col-span-2 rounded-panel border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-accent" />
              <h2 className="text-[14px] font-semibold text-text">Guías Recientes en Tráfico</h2>
            </div>
            <Link
              to="/guias"
              className="text-[12px] font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>Ver todas ({guias.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loadingGuias ? (
              <div className="p-8 text-center text-text-muted text-[13px] flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span>Cargando actividad reciente...</span>
              </div>
            ) : guias.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-[13px] space-y-2">
                <Package className="w-8 h-8 text-text-faint mx-auto opacity-50" />
                <p>No hay guías registradas en el sistema todavía.</p>
                <Link to="/guias">
                  <Button variant="primary" size="sm" className="mt-1">
                    Emitir primera guía
                  </Button>
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/50 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">No. Guía</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Peso (kg)</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Costo</th>
                    <th className="py-2.5 px-3 font-semibold">Estado</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {guias.slice(-6).reverse().map((g) => (
                    <tr key={g.numeroGuia} className="hover:bg-surface-hover/40 transition-colors h-10">
                      <td className="py-2 px-3 font-mono font-bold">
                        <Link
                          to={`/rastreo?no=${g.numeroGuia}`}
                          className="text-text hover:text-accent tabular-nums"
                        >
                          #{g.numeroGuia}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-right text-text font-mono tabular-nums">
                        {formatWeight(g.pesoFacturableKg)}
                      </td>
                      <td className="py-2 px-3 text-right text-text font-mono font-medium tabular-nums">
                        {formatCurrency(g.costoTotal)}
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={g.estado} />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link
                          to={`/rastreo?no=${g.numeroGuia}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                        >
                          <span>Rastrear</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Flota Vehicular (1 columna) */}
        <div className="rounded-panel border border-border bg-surface flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent" />
                <h2 className="text-[14px] font-semibold text-text">Flota Vehicular</h2>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                <strong className="text-ok font-mono">{vehiculosDisponibles}</strong> de {vehiculos.length} disponibles
              </p>
            </div>
            <Link
              to="/catalogos/vehiculos"
              className="text-[12px] font-medium text-text-muted hover:text-text transition-colors"
            >
              Gestionar
            </Link>
          </div>

          <div className="p-3 flex-1 overflow-y-auto max-h-[380px]">
            {loadingVehiculos ? (
              <div className="p-6 text-center text-text-muted text-[12px]">Cargando flota...</div>
            ) : vehiculos.length === 0 ? (
              <div className="p-6 text-center text-[12px] space-y-2">
                <p className="text-text-muted">No hay vehículos en la flota.</p>
                <Link to="/catalogos/vehiculos">
                  <Button variant="outline" size="sm">
                    Registrar vehículo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {vehiculos.slice(0, 6).map((v: Vehiculo) => (
                  <div
                    key={v.id}
                    className="py-2.5 flex items-center justify-between text-[12px] hover:bg-surface-hover/30 px-1.5 rounded transition-colors"
                  >
                    <div>
                      <p className="text-text font-mono font-bold">{v.placa}</p>
                      <p className="text-[11px] text-text-muted truncate max-w-[130px]">{v.marcaModelo}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={v.estado} />
                      <p className="text-[10px] text-text-faint font-mono tabular-nums mt-0.5">
                        {v.capacidadPesoKg} kg · {v.capacidadVolumenM3} m³
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-2.5 bg-surface-hover/40 border-t border-border text-center">
            <Link
              to="/despacho"
              className="text-[12px] font-semibold text-accent hover:underline block"
            >
              Ir a Bahía de Despacho Vehicular →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
