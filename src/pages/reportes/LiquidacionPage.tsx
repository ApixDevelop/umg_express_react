import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportesApi } from "@/api/reportes";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

export function LiquidacionPage() {
  const [activeTab, setActiveTab] = useState<"resumen" | "sucursales" | "rutas" | "estados" | "detalle">("resumen");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["liquidacion"],
    queryFn: () => reportesApi.obtenerLiquidacion(),
  });

  const exportCSV = () => {
    if (!data?.desgloseGuias) return;
    const headers = "NumeroGuia,Estado,SucursalOrigen,IdRuta,IdRemitente,IdDestinatario,PesoFacturableKg,CostoTotal\n";
    const rows = data.desgloseGuias
      .map(
        (g) =>
          `${g.numeroGuia},${g.estado},"${g.sucursalOrigen || ""}",${g.idRuta},${g.idClienteRemitente},${g.idClienteDestinatario},${g.pesoFacturableKg},${g.costoTotal}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `liquidacion_umg_express_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Archivo CSV exportado exitosamente");
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 text-xs">Calculando liquidación financiera...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-6 text-center text-xs text-rose-400">
        {(error as any)?.message || "Error al cargar reporte de liquidación financiera"}
      </div>
    );
  }

  const {
    resumenFinanciero,
    guiasPorEstado = [],
    resumenPorRuta = [],
    resumenPorSucursalOrigen = [],
    desgloseGuias = [],
  } = data || ({} as any);

  // Totals calculations for tables
  const totalGuiasSucursales = resumenPorSucursalOrigen.reduce((acc: number, s: any) => acc + (s.cantidadGuias || 0), 0);
  const totalFacturadoSucursales = resumenPorSucursalOrigen.reduce((acc: number, s: any) => acc + (s.importeTotal || 0), 0);

  const totalGuiasRutas = resumenPorRuta.reduce((acc: number, r: any) => acc + (r.cantidadGuias || 0), 0);
  const totalFacturadoRutas = resumenPorRuta.reduce((acc: number, r: any) => acc + (r.importeTotal || 0), 0);

  const totalPesoDesglose = desgloseGuias.reduce((acc: number, g: any) => acc + (g.pesoFacturableKg || 0), 0);
  const totalFleteDesglose = desgloseGuias.reduce((acc: number, g: any) => acc + (g.costoTotal || 0), 0);

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Liquidación Financiera</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Consolidado general de ingresos brutos y fletes por sucursal, ruta y estado
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Imprimir
          </Button>
        </div>
      </div>

      {/* Franja de KPI unificada (sober strip) */}
      <div className="rounded-xl border border-slate-800 bg-[#0c1220] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        <div className="p-4 space-y-1">
          <p className="text-xs text-slate-400">Importe facturado</p>
          <p className="text-xl font-semibold text-slate-100 tabular-nums">
            {formatCurrency(resumenFinanciero?.importeTotalFacturado)}
          </p>
          <p className="text-[11px] text-slate-500">Cobro total registrado</p>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-xs text-slate-400">Guías contabilizadas</p>
          <p className="text-xl font-semibold text-slate-100 tabular-nums">
            {resumenFinanciero?.totalGuiasConsideradas ?? 0}
          </p>
          <p className="text-[11px] text-slate-500">Enviadas o activas</p>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-xs text-slate-400">Guías inactivas</p>
          <p className="text-xl font-semibold text-slate-100 tabular-nums">
            {resumenFinanciero?.totalGuiasInactivas ?? 0}
          </p>
          <p className="text-[11px] text-slate-500">Bajas lógicas</p>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-xs text-slate-400">Cobro confirmado</p>
          <p className="text-xl font-semibold text-slate-100 tabular-nums">
            {formatCurrency(resumenFinanciero?.cobradoConfirmado)}
          </p>
          <p className="text-[11px] text-slate-500">Entregadas</p>
        </div>
      </div>

      {/* Pestañas sobrias */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs no-print overflow-x-auto">
        <button
          onClick={() => setActiveTab("resumen")}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === "resumen" ? "bg-slate-800 text-slate-100 font-medium" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab("sucursales")}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === "sucursales" ? "bg-slate-800 text-slate-100 font-medium" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Por sucursal ({resumenPorSucursalOrigen.length})
        </button>
        <button
          onClick={() => setActiveTab("rutas")}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === "rutas" ? "bg-slate-800 text-slate-100 font-medium" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Por ruta ({resumenPorRuta.length})
        </button>
        <button
          onClick={() => setActiveTab("estados")}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === "estados" ? "bg-slate-800 text-slate-100 font-medium" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Por estado ({guiasPorEstado.length})
        </button>
        <button
          onClick={() => setActiveTab("detalle")}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === "detalle" ? "bg-slate-800 text-slate-100 font-medium" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Desglose de guías ({desgloseGuias.length})
        </button>
      </div>

      {/* Tabla 1: Por Sucursal Origen */}
      {(activeTab === "resumen" || activeTab === "sucursales") && (
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="text-xs font-medium text-slate-200">Ingresos por sucursal de origen</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Sucursal de origen</th>
                  <th className="py-2 px-3 text-right">Guías</th>
                  <th className="py-2 px-3 text-right">Total facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {resumenPorSucursalOrigen.map((s: any) => (
                  <tr key={s.idSucursal} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 text-slate-400 font-mono">#{s.idSucursal}</td>
                    <td className="py-2 px-3 text-slate-200">{s.nombre}</td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{s.cantidadGuias}</td>
                    <td className="py-2 px-3 text-right text-slate-200 font-medium tabular-nums">
                      {formatCurrency(s.importeTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-800 bg-slate-900/70 text-slate-200 font-medium text-xs">
                <tr>
                  <td className="py-2 px-3" colSpan={2}>Total consolidado</td>
                  <td className="py-2 px-3 text-right tabular-nums">{totalGuiasSucursales}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-amber-500 font-semibold">
                    {formatCurrency(totalFacturadoSucursales)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tabla 2: Por Ruta */}
      {(activeTab === "resumen" || activeTab === "rutas") && (
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="text-xs font-medium text-slate-200">Ingresos agrupados por ruta</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2 px-3">Ruta</th>
                  <th className="py-2 px-3 text-right">Guías</th>
                  <th className="py-2 px-3 text-right">Total facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {resumenPorRuta.map((r: any) => (
                  <tr key={r.idRuta} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 text-slate-200 font-mono">Ruta #{r.idRuta}</td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{r.cantidadGuias}</td>
                    <td className="py-2 px-3 text-right text-slate-200 font-medium tabular-nums">
                      {formatCurrency(r.importeTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-800 bg-slate-900/70 text-slate-200 font-medium text-xs">
                <tr>
                  <td className="py-2 px-3">Total consolidado</td>
                  <td className="py-2 px-3 text-right tabular-nums">{totalGuiasRutas}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-amber-500 font-semibold">
                    {formatCurrency(totalFacturadoRutas)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tabla 3: Por Estado */}
      {activeTab === "estados" && (
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="text-xs font-medium text-slate-200">Distribución de guías por estado</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3 text-right">Cantidad de guías</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {guiasPorEstado.map((e: any) => (
                  <tr key={e.estado} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3">
                      <StatusBadge status={e.estado} />
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200 font-medium tabular-nums">
                      {e.cantidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla 4: Desglose Individual de Guías */}
      {activeTab === "detalle" && (
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="text-xs font-medium text-slate-200">Desglose individual de guías auditadas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2 px-3">No. guía</th>
                  <th className="py-2 px-3">Sucursal origen</th>
                  <th className="py-2 px-3">Ruta</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3 text-right">Peso fact.</th>
                  <th className="py-2 px-3 text-right">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {desgloseGuias.map((g: any) => (
                  <tr key={g.numeroGuia} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 text-slate-200 font-mono font-medium">
                      {g.numeroGuia}
                    </td>
                    <td className="py-2 px-3 text-slate-300">
                      {g.sucursalOrigen || `Suc #${g.idRuta}`}
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-mono">
                      Ruta #{g.idRuta}
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={g.estado} />
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">
                      {formatWeight(g.pesoFacturableKg)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200 font-medium tabular-nums">
                      {formatCurrency(g.costoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-800 bg-slate-900/70 text-slate-200 font-medium text-xs">
                <tr>
                  <td className="py-2.5 px-3" colSpan={4}>
                    Total ({desgloseGuias.length} guías)
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {formatWeight(totalPesoDesglose)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-amber-500 font-semibold">
                    {formatCurrency(totalFleteDesglose)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
