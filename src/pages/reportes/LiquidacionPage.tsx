import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportesApi } from "@/api/reportes";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
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
    return <div className="p-8 text-center text-text-muted text-[13px]">Calculando liquidación financiera...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-panel border border-border bg-surface p-6 text-center text-[13px] text-danger">
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

  const totalGuiasSucursales = resumenPorSucursalOrigen.reduce((acc: number, s: any) => acc + (s.cantidadGuias || 0), 0);
  const totalFacturadoSucursales = resumenPorSucursalOrigen.reduce((acc: number, s: any) => acc + (s.importeTotal || 0), 0);

  const totalGuiasRutas = resumenPorRuta.reduce((acc: number, r: any) => acc + (r.cantidadGuias || 0), 0);
  const totalFacturadoRutas = resumenPorRuta.reduce((acc: number, r: any) => acc + (r.importeTotal || 0), 0);

  const totalPesoDesglose = desgloseGuias.reduce((acc: number, g: any) => acc + (g.pesoFacturableKg || 0), 0);
  const totalFleteDesglose = desgloseGuias.reduce((acc: number, g: any) => acc + (g.costoTotal || 0), 0);

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text">Liquidación financiera</h1>
        <div className="flex items-center gap-2 no-print">
          <Button
            variant="secondary"
            size="sm"
            onClick={exportCSV}
          >
            Exportar CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
        </div>
      </div>

      {/* Franja unificada de métricas */}
      <div className="rounded-panel border border-border bg-surface grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="p-4 space-y-1">
          <div className="text-[12px] text-text-muted">Importe facturado</div>
          <div className="text-[24px] font-semibold text-text tabular-nums leading-none">
            {formatCurrency(resumenFinanciero?.importeTotalFacturado)}
          </div>
          <div className="text-[12px] text-text-faint">total registrado</div>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-[12px] text-text-muted">Guías contabilizadas</div>
          <div className="text-[24px] font-semibold text-text tabular-nums leading-none">
            {resumenFinanciero?.totalGuiasConsideradas ?? 0}
          </div>
          <div className="text-[12px] text-text-faint">activas</div>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-[12px] text-text-muted">Guías inactivas</div>
          <div className="text-[24px] font-semibold text-text tabular-nums leading-none">
            {resumenFinanciero?.totalGuiasInactivas ?? 0}
          </div>
          <div className="text-[12px] text-text-faint">bajas lógicas</div>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-[12px] text-text-muted">Cobro confirmado</div>
          <div className="text-[24px] font-semibold text-text tabular-nums leading-none">
            {formatCurrency(resumenFinanciero?.cobradoConfirmado)}
          </div>
          <div className="text-[12px] text-text-faint">entregadas</div>
        </div>
      </div>

      {/* Pestañas sobrias */}
      <div className="flex items-center gap-1 border-b border-border pb-2 text-[12px] no-print overflow-x-auto">
        <button
          onClick={() => setActiveTab("resumen")}
          className={`px-2.5 py-1 rounded-control transition-colors cursor-pointer ${
            activeTab === "resumen" ? "bg-surface-hover text-text font-medium" : "text-text-muted hover:text-text"
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab("sucursales")}
          className={`px-2.5 py-1 rounded-control transition-colors cursor-pointer ${
            activeTab === "sucursales" ? "bg-surface-hover text-text font-medium" : "text-text-muted hover:text-text"
          }`}
        >
          Por sucursal ({resumenPorSucursalOrigen.length})
        </button>
        <button
          onClick={() => setActiveTab("rutas")}
          className={`px-2.5 py-1 rounded-control transition-colors cursor-pointer ${
            activeTab === "rutas" ? "bg-surface-hover text-text font-medium" : "text-text-muted hover:text-text"
          }`}
        >
          Por ruta ({resumenPorRuta.length})
        </button>
        <button
          onClick={() => setActiveTab("estados")}
          className={`px-2.5 py-1 rounded-control transition-colors cursor-pointer ${
            activeTab === "estados" ? "bg-surface-hover text-text font-medium" : "text-text-muted hover:text-text"
          }`}
        >
          Por estado ({guiasPorEstado.length})
        </button>
        <button
          onClick={() => setActiveTab("detalle")}
          className={`px-2.5 py-1 rounded-control transition-colors cursor-pointer ${
            activeTab === "detalle" ? "bg-surface-hover text-text font-medium" : "text-text-muted hover:text-text"
          }`}
        >
          Desglose ({desgloseGuias.length})
        </button>
      </div>

      {/* Tabla 1: Por Sucursal Origen */}
      {(activeTab === "resumen" || activeTab === "sucursales") && (
        <div className="rounded-panel border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[14px] font-semibold text-text">Ingresos por sucursal de origen</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">ID</th>
                  <th className="py-2 px-3 font-medium">Sucursal</th>
                  <th className="py-2 px-3 text-right font-medium">Guías</th>
                  <th className="py-2 px-3 text-right font-medium">Total facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resumenPorSucursalOrigen.map((s: any) => (
                  <tr key={s.idSucursal} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text-muted tabular-nums">#{s.idSucursal}</td>
                    <td className="py-2 px-3 text-text">{s.nombre}</td>
                    <td className="py-2 px-3 text-right text-text tabular-nums">{s.cantidadGuias}</td>
                    <td className="py-2 px-3 text-right text-text font-medium tabular-nums">
                      {formatCurrency(s.importeTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-surface-hover text-text font-medium text-[13px]">
                <tr>
                  <td className="py-2 px-3" colSpan={2}>Total consolidado</td>
                  <td className="py-2 px-3 text-right tabular-nums">{totalGuiasSucursales}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-accent font-semibold">
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
        <div className="rounded-panel border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[14px] font-semibold text-text">Ingresos agrupados por ruta</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">Ruta</th>
                  <th className="py-2 px-3 text-right font-medium">Guías</th>
                  <th className="py-2 px-3 text-right font-medium">Total facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resumenPorRuta.map((r: any) => (
                  <tr key={r.idRuta} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text tabular-nums">Ruta #{r.idRuta}</td>
                    <td className="py-2 px-3 text-right text-text tabular-nums">{r.cantidadGuias}</td>
                    <td className="py-2 px-3 text-right text-text font-medium tabular-nums">
                      {formatCurrency(r.importeTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-surface-hover text-text font-medium text-[13px]">
                <tr>
                  <td className="py-2 px-3">Total consolidado</td>
                  <td className="py-2 px-3 text-right tabular-nums">{totalGuiasRutas}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-accent font-semibold">
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
        <div className="rounded-panel border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[14px] font-semibold text-text">Distribución de guías por estado</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">Estado</th>
                  <th className="py-2 px-3 text-right font-medium">Cantidad de guías</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {guiasPorEstado.map((e: any) => (
                  <tr key={e.estado} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3">
                      <StatusBadge status={e.estado} />
                    </td>
                    <td className="py-2 px-3 text-right text-text font-medium tabular-nums">
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
        <div className="rounded-panel border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[14px] font-semibold text-text">Desglose individual de guías auditadas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">No. guía</th>
                  <th className="py-2 px-3 font-medium">Sucursal origen</th>
                  <th className="py-2 px-3 font-medium">Ruta</th>
                  <th className="py-2 px-3 font-medium">Estado</th>
                  <th className="py-2 px-3 text-right font-medium">Peso (kg)</th>
                  <th className="py-2 px-3 text-right font-medium">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {desgloseGuias.map((g: any) => (
                  <tr key={g.numeroGuia} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text tabular-nums font-medium">
                      {g.numeroGuia}
                    </td>
                    <td className="py-2 px-3 text-text">
                      {g.sucursalOrigen || `Suc #${g.idRuta}`}
                    </td>
                    <td className="py-2 px-3 text-text-muted tabular-nums">
                      Ruta #{g.idRuta}
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={g.estado} />
                    </td>
                    <td className="py-2 px-3 text-right text-text tabular-nums">
                      {formatWeight(g.pesoFacturableKg)}
                    </td>
                    <td className="py-2 px-3 text-right text-text font-medium tabular-nums">
                      {formatCurrency(g.costoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-surface-hover text-text font-medium text-[13px]">
                <tr>
                  <td className="py-2 px-3" colSpan={4}>
                    Total ({desgloseGuias.length} guías)
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums">
                    {formatWeight(totalPesoDesglose)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-accent font-semibold">
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