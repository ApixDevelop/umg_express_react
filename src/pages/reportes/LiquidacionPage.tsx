import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportesApi } from "@/api/reportes";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import type { LiquidacionInfo } from "@/types";
import {
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Download,
  Building2,
  Route,
  Search,
  CheckCircle2,
  Layers,
  Scale
} from "lucide-react";

type TabOption = "resumen" | "sucursales" | "rutas" | "estados" | "detalle";

export function LiquidacionPage() {
  const [activeTab, setActiveTab] = useState<TabOption>("resumen");
  const [filterQuery, setFilterQuery] = useState("");

  const {
    data: liquidacion,
    isLoading,
    isError,
    error,
  } = useQuery<LiquidacionInfo>({
    queryKey: ["liquidacion"],
    queryFn: () => reportesApi.obtenerLiquidacion(),
  });

  if (isLoading) {
    return (
      <div className="rounded-panel border border-border bg-surface p-12 text-center text-[13px] text-text-muted flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span>Consolidando y auditando liquidación financiera...</span>
      </div>
    );
  }

  if (isError || !liquidacion) {
    return (
      <div className="rounded-panel border border-danger/30 bg-danger/5 p-6 text-center space-y-2">
        <h3 className="text-[14px] font-semibold text-danger">Error al cargar la liquidación</h3>
        <p className="text-[13px] text-text-muted">
          {(error as any)?.message || "No se pudo recuperar la información contable del servidor."}
        </p>
      </div>
    );
  }

  const {
    resumenFinanciero,
    guiasPorEstado = [],
    resumenPorRuta = [],
    resumenPorSucursalOrigen = [],
    desgloseGuias = [],
  } = liquidacion;

  const totalFacturado = resumenFinanciero.importeTotalFacturado || 0;
  const totalGuias = resumenFinanciero.totalGuiasConsideradas || 0;
  const cobradoConfirmado = resumenFinanciero.cobradoConfirmado || 0;
  const promedioPorGuia = totalGuias > 0 ? totalFacturado / totalGuias : 0;
  const porcentajeCobrado = totalFacturado > 0 ? Math.min(100, (cobradoConfirmado / totalFacturado) * 100) : 100;

  const totalPesoDesglose = desgloseGuias.reduce((acc, g) => acc + (g.pesoFacturableKg || 0), 0);
  const totalFleteDesglose = desgloseGuias.reduce((acc, g) => acc + (g.costoTotal || 0), 0);

  // Filtro de auditoría de guías
  const filteredGuias = desgloseGuias.filter((g) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      g.numeroGuia.toString().includes(q) ||
      (g.sucursalOrigen && g.sucursalOrigen.toLowerCase().includes(q)) ||
      (g.estado && g.estado.toLowerCase().includes(q))
    );
  });

  const exportCSV = () => {
    const headers = ["No. Guia", "Sucursal Origen", "ID Ruta", "Estado", "Peso (kg)", "Costo (GTQ)"];
    const rows = desgloseGuias.map((g) => [
      g.numeroGuia,
      `"${g.sucursalOrigen || "-"}"`,
      g.idRuta,
      g.estado,
      g.pesoFacturableKg,
      g.costoTotal.toFixed(2),
    ]);

    const csvContent = [
      `"LIQUIDACION FINANCIERA UMG EXPRESS"`,
      `"Fecha de Generacion: ${new Date().toISOString()}"`,
      `"Facturacion Total: ${totalFacturado.toFixed(2)} GTQ"`,
      `"Total Guias Auditadas: ${totalGuias}"`,
      "",
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `liquidacion_financiera_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
            {/* Encabezado Formal para Impresión Oficial */}
      <div className="print-only border-b-2 border-black pb-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16pt] font-black text-black leading-none">
              UMG EXPRESS · REPORTE FINANCIERO Y ARQUEO
            </h2>
            <p className="text-[9pt] text-gray-700 tracking-wider uppercase font-semibold mt-1">
              Consolidado de Fletes, Ingresos y Conciliación Contable
            </p>
            <p className="text-[8.5pt] text-gray-600">
              Guatemala, C.A. · Moneda de curso legal: Quetzales (GTQ)
            </p>
          </div>
          <div className="text-right">
            <div className="border border-black px-3 py-1 font-mono font-bold text-[12pt] text-black bg-gray-50">
              ARQUEO AUDITADO
            </div>
            <p className="text-[8.5pt] text-gray-600 mt-1">
              Fecha de emisión: {new Date().toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-text tracking-tight">Liquidación Financiera</h1>
            <Badge variant="success">Conciliación Contable</Badge>
          </div>
          <p className="text-[13px] text-text-muted mt-0.5">
            Arqueo de ingresos, facturación por sucursal y conciliación de fletes en Quetzales (GTQ).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Arqueo</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de Telemetría Contable (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Facturación Total */}
        <div className="p-4 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <span>Facturación Consolidada</span>
            <div className="w-6 h-6 rounded bg-accent/10 text-accent flex items-center justify-center font-bold">
              Q
            </div>
          </div>
          <div className="my-2">
            <div className="font-mono font-bold text-[22px] text-text tracking-tight">
              {formatCurrency(totalFacturado)}
            </div>
            <p className="text-[11px] text-ok flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Auditoría de fletes activa</span>
            </p>
          </div>
          <div className="text-[11px] text-text-faint font-mono pt-1.5 border-t border-border/50">
            Base gravable institucional
          </div>
        </div>

        {/* KPI 2: Total Guías */}
        <div className="p-4 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <span>Envíos Auditados</span>
            <div className="w-6 h-6 rounded bg-info/10 text-info flex items-center justify-center">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-mono font-bold text-[22px] text-text tracking-tight">
              {totalGuias} <span className="text-[13px] font-normal text-text-muted">guías</span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Promedio: <strong className="font-mono text-text">{formatCurrency(promedioPorGuia)}</strong> / envío
            </p>
          </div>
          <div className="text-[11px] text-text-faint font-mono pt-1.5 border-t border-border/50">
            {resumenFinanciero.totalGuiasInactivas || 0} canceladas / anuladas
          </div>
        </div>

        {/* KPI 3: Cobrado Confirmado */}
        <div className="p-4 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <span>Cobranza Confirmada</span>
            <div className="w-6 h-6 rounded bg-ok/10 text-ok flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-mono font-bold text-[22px] text-ok tracking-tight">
              {formatCurrency(cobradoConfirmado)}
            </div>
            <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-ok h-full rounded-full transition-all duration-500"
                style={{ width: `${porcentajeCobrado}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-text-faint font-mono pt-1.5 border-t border-border/50">
            {porcentajeCobrado.toFixed(1)}% tasa de efectividad de cobro
          </div>
        </div>

        {/* KPI 4: Masa Logística Facturada */}
        <div className="p-4 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <span>Masa Logística Facturada</span>
            <div className="w-6 h-6 rounded bg-accent/10 text-accent flex items-center justify-center">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-mono font-bold text-[22px] text-text tracking-tight">
              {formatWeight(totalPesoDesglose)}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Tarifa media:{" "}
              <strong className="font-mono text-text">
                {totalPesoDesglose > 0 ? (totalFacturado / totalPesoDesglose).toFixed(2) : "0.00"} Q/kg
              </strong>
            </p>
          </div>
          <div className="text-[11px] text-text-faint font-mono pt-1.5 border-t border-border/50">
            Basado en peso facturable auditado
          </div>
        </div>
      </div>

      {/* Selector de Pestañas con Tactile Micro-Interactions */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab("resumen")}
          className={`px-3 py-1.5 rounded-control text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap active:scale-[0.97] ${
            activeTab === "resumen"
              ? "bg-accent text-white shadow-sm"
              : "text-text-muted hover:text-text hover:bg-surface-hover"
          }`}
        >
          Resumen Consolidado
        </button>
        <button
          onClick={() => setActiveTab("sucursales")}
          className={`px-3 py-1.5 rounded-control text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap active:scale-[0.97] ${
            activeTab === "sucursales"
              ? "bg-accent text-white shadow-sm"
              : "text-text-muted hover:text-text hover:bg-surface-hover"
          }`}
        >
          Por Sucursal ({resumenPorSucursalOrigen.length})
        </button>
        <button
          onClick={() => setActiveTab("rutas")}
          className={`px-3 py-1.5 rounded-control text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap active:scale-[0.97] ${
            activeTab === "rutas"
              ? "bg-accent text-white shadow-sm"
              : "text-text-muted hover:text-text hover:bg-surface-hover"
          }`}
        >
          Por Ruta ({resumenPorRuta.length})
        </button>
        <button
          onClick={() => setActiveTab("estados")}
          className={`px-3 py-1.5 rounded-control text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap active:scale-[0.97] ${
            activeTab === "estados"
              ? "bg-accent text-white shadow-sm"
              : "text-text-muted hover:text-text hover:bg-surface-hover"
          }`}
        >
          Por Estado ({guiasPorEstado.length})
        </button>
        <button
          onClick={() => setActiveTab("detalle")}
          className={`px-3 py-1.5 rounded-control text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap active:scale-[0.97] ${
            activeTab === "detalle"
              ? "bg-accent text-white shadow-sm"
              : "text-text-muted hover:text-text hover:bg-surface-hover"
          }`}
        >
          Auditoría de Guías ({desgloseGuias.length})
        </button>
      </div>

      {/* Contenido: Tab Sucursales (o Resumen) */}
      {(activeTab === "resumen" || activeTab === "sucursales") && (
        <div className="rounded-panel border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent" />
              <h2 className="text-[14px] font-semibold text-text">Ingresos Distribuidos por Sucursal de Origen</h2>
            </div>
            <span className="text-[12px] text-text-muted font-mono">
              Total Sucursales: {resumenPorSucursalOrigen.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">ID</th>
                  <th className="py-2.5 px-4 font-semibold">Sucursal Origen</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Guías Emitidas</th>
                  <th className="py-2.5 px-4 font-semibold text-center w-40">Participación</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Total Facturado (GTQ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resumenPorSucursalOrigen.map((s) => {
                  const pct = totalFacturado > 0 ? (s.importeTotal / totalFacturado) * 100 : 0;
                  return (
                    <tr key={s.idSucursal} className="hover:bg-surface-hover/40 transition-colors h-11">
                      <td className="py-2.5 px-4 text-text-muted font-mono">#{s.idSucursal}</td>
                      <td className="py-2.5 px-4 text-text font-medium">{s.nombre}</td>
                      <td className="py-2.5 px-4 text-right text-text font-mono tabular-nums">
                        {s.cantidadGuias}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-surface-hover h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-accent h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-text-muted w-10 text-right">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right text-text font-mono font-semibold tabular-nums">
                        {formatCurrency(s.importeTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-border bg-surface-hover/80 text-text font-semibold text-[13px]">
                <tr>
                  <td className="py-2.5 px-4" colSpan={2}>
                    Total Consolidado por Sucursales
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                    {resumenPorSucursalOrigen.reduce((acc, s) => acc + s.cantidadGuias, 0)}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono text-[11px] text-text-muted">
                    100.0%
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-accent font-bold tabular-nums">
                    {formatCurrency(totalFacturado)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Contenido: Tab Rutas (o Resumen) */}
      {(activeTab === "resumen" || activeTab === "rutas") && (
        <div className="rounded-panel border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-accent" />
              <h2 className="text-[14px] font-semibold text-text">Ingresos Agrupados por Ruta Logística</h2>
            </div>
            <span className="text-[12px] text-text-muted font-mono">
              Total Rutas: {resumenPorRuta.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">ID Ruta</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Envíos Movilizados</th>
                  <th className="py-2.5 px-4 font-semibold text-center w-40">Proporción</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Importe Facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resumenPorRuta.map((r) => {
                  const pct = totalFacturado > 0 ? (r.importeTotal / totalFacturado) * 100 : 0;
                  return (
                    <tr key={r.idRuta} className="hover:bg-surface-hover/40 transition-colors h-11">
                      <td className="py-2.5 px-4 font-mono font-medium text-text">
                        Ruta #{r.idRuta}
                      </td>
                      <td className="py-2.5 px-4 text-right text-text font-mono tabular-nums">
                        {r.cantidadGuias}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-surface-hover h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-info h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-text-muted w-10 text-right">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right text-text font-mono font-semibold tabular-nums">
                        {formatCurrency(r.importeTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-border bg-surface-hover/80 text-text font-semibold text-[13px]">
                <tr>
                  <td className="py-2.5 px-4">Consolidado por Red de Rutas</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                    {resumenPorRuta.reduce((acc, r) => acc + r.cantidadGuias, 0)}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono text-[11px] text-text-muted">
                    100.0%
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-accent font-bold tabular-nums">
                    {formatCurrency(resumenPorRuta.reduce((acc, r) => acc + r.importeTotal, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Contenido: Tab Estados */}
      {activeTab === "estados" && (
        <div className="rounded-panel border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[14px] font-semibold text-text">Distribución Operativa por Estado de Guía</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Estado de Envío</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Cantidad de Guías</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Total Monetario (GTQ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {guiasPorEstado.map((e) => (
                  <tr key={e.estado} className="hover:bg-surface-hover/40 transition-colors h-11">
                    <td className="py-2.5 px-4">
                      <StatusBadge status={e.estado} />
                    </td>
                    <td className="py-2.5 px-4 text-right text-text font-mono font-medium tabular-nums">
                      {e.cantidadGuias}
                    </td>
                    <td className="py-2.5 px-4 text-right text-text font-mono font-semibold tabular-nums">
                      {formatCurrency(e.importeTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenido: Tab Detalle / Auditoría */}
      {activeTab === "detalle" && (
        <div className="rounded-panel border border-border bg-surface overflow-hidden space-y-0">
          <div className="p-3.5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-text">Auditoría Individual de Guías ({filteredGuias.length})</h2>
              <p className="text-[12px] text-text-muted">Registro pormenorizado para trazabilidad contable.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Buscar por guía o sucursal..."
                className="w-full h-8 bg-surface text-text text-[12px] rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead className="sticky top-0 bg-surface z-10">
                <tr className="border-b border-border bg-surface-hover/70 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">No. Guía</th>
                  <th className="py-2.5 px-3 font-semibold">Sucursal Origen</th>
                  <th className="py-2.5 px-3 font-semibold">Ruta</th>
                  <th className="py-2.5 px-3 font-semibold">Estado</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Peso (kg)</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Flete Cobrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGuias.map((g) => (
                  <tr key={g.numeroGuia} className="hover:bg-surface-hover/40 transition-colors h-9">
                    <td className="py-2 px-3 font-mono font-bold text-text tabular-nums">
                      #{g.numeroGuia}
                    </td>
                    <td className="py-2 px-3 text-text truncate max-w-[150px]">
                      {g.sucursalOrigen || `Sucursal #${g.idRuta}`}
                    </td>
                    <td className="py-2 px-3 text-text-muted font-mono">
                      Ruta #{g.idRuta}
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={g.estado} />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-text tabular-nums">
                      {formatWeight(g.pesoFacturableKg)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-text tabular-nums">
                      {formatCurrency(g.costoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-surface-hover border-t-2 border-border text-text font-semibold text-[12px]">
                <tr>
                  <td className="py-2.5 px-3" colSpan={4}>
                    Total ({filteredGuias.length} guías filtradas)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {formatWeight(totalPesoDesglose)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-accent font-bold tabular-nums">
                    {formatCurrency(totalFleteDesglose)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Bloque Legal de Auditoría Contable (para Impresión) */}
      <div className="pt-8 border-t border-border print-only print:border-black">
        <div className="grid grid-cols-2 gap-12 text-center text-[12px]">
          <div className="space-y-1">
            <div className="border-b border-black h-12" />
            <p className="font-semibold text-black pt-1">Auditor Contable Responsable</p>
            <p className="text-[11px] text-gray-600">Colegiado y Registro Tributario</p>
          </div>
          <div className="space-y-1">
            <div className="border-b border-black h-12" />
            <p className="font-semibold text-black pt-1">Gerencia Financiera y Administrativa</p>
            <p className="text-[11px] text-gray-600">Visto Bueno de Conciliación</p>
          </div>
        </div>
      </div>
    </div>
  );
}
