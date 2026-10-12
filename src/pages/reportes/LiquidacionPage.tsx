import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportesApi } from "@/api/reportes";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import {
  DollarSign,
  Package,
  TrendingUp,
  Download,
  Printer,
  ShieldAlert,
  BarChart3,
  MapPin,
  Building,
} from "lucide-react";
import { toast } from "sonner";

export function LiquidacionPage() {
  const [activeTab, setActiveTab] = useState<"resumen" | "estados" | "rutas" | "sucursales" | "detalle">("resumen");

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
    toast.success("Archivo CSV generado exitosamente");
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 text-sm">Calculando liquidación financiera...</div>;
  }

  if (isError) {
    return (
      <Card className="p-8 text-center text-rose-400">
        <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-rose-500" />
        <h3 className="font-bold text-base">Error al cargar liquidación</h3>
        <p className="text-xs text-slate-400 mt-1">{(error as any)?.message || "Permiso denegado o error del servidor"}</p>
      </Card>
    );
  }

  const { resumenFinanciero, guiasPorEstado = [], resumenPorRuta = [], resumenPorSucursalOrigen = [], desgloseGuias = [] } =
    data || ({} as any);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Reporte de Liquidación Financiera
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consolidado general de ingresos brutos, fletes registrados y auditoría contable por sucursal y estado.
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" onClick={exportCSV} leftIcon={<Download className="w-4 h-4" />}>
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
            Imprimir
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Importe Total Facturado"
          value={formatCurrency(resumenFinanciero?.importeTotalFacturado)}
          subtitle="Cobros totales en sistema"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          colorAccent="emerald"
        />
        <StatCard
          title="Guías Contabilizadas"
          value={resumenFinanciero?.totalGuiasConsideradas ?? 0}
          subtitle="Envíos registrados activos"
          icon={<Package className="w-5 h-5 text-amber-500" />}
          colorAccent="amber"
        />
        <StatCard
          title="Guías Desactivadas"
          value={resumenFinanciero?.totalGuiasInactivas ?? 0}
          subtitle="Baja lógica"
          icon={<ShieldAlert className="w-5 h-5 text-slate-400" />}
          colorAccent="blue"
        />
        <StatCard
          title="Cobrado Confirmado"
          value={formatCurrency(resumenFinanciero?.cobradoConfirmado)}
          subtitle="Ingresos en caja"
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
          colorAccent="indigo"
        />
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 no-print overflow-x-auto">
        <button
          onClick={() => setActiveTab("resumen")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === "resumen" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Resumen Consolidado
        </button>
        <button
          onClick={() => setActiveTab("sucursales")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === "sucursales" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Por Sucursal Origen ({resumenPorSucursalOrigen.length})
        </button>
        <button
          onClick={() => setActiveTab("rutas")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === "rutas" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Por Ruta ({resumenPorRuta.length})
        </button>
        <button
          onClick={() => setActiveTab("estados")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === "estados" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Por Estado ({guiasPorEstado.length})
        </button>
        <button
          onClick={() => setActiveTab("detalle")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === "detalle" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Desglose Individual ({desgloseGuias.length})
        </button>
      </div>

      {/* Tab 1: Resumen Consolidado */}
      {(activeTab === "resumen" || activeTab === "sucursales") && (
        <Card className="p-6 space-y-4">
          <CardHeader className="mb-2">
            <div>
              <CardTitle>Ingresos por Sucursal de Origen</CardTitle>
              <CardDescription>Total recaudado según agencia de recepción</CardDescription>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">ID Sucursal</th>
                  <th className="py-2.5 px-3">Agencia de Origen</th>
                  <th className="py-2.5 px-3">Cantidad Guías</th>
                  <th className="py-2.5 px-3 text-right">Total Facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {resumenPorSucursalOrigen.map((s: any) => (
                  <tr key={s.idSucursal} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 text-slate-400">#{s.idSucursal}</td>
                    <td className="py-3 px-3 text-slate-100 font-bold">{s.nombre}</td>
                    <td className="py-3 px-3 text-slate-300">{s.cantidadGuias} paquetes</td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-400">
                      {formatCurrency(s.importeTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Rutas */}
      {(activeTab === "resumen" || activeTab === "rutas") && (
        <Card className="p-6 space-y-4">
          <CardHeader className="mb-2">
            <div>
              <CardTitle>Ingresos Agrupados por Ruta</CardTitle>
              <CardDescription>Volumen e importe facturado por trayecto</CardDescription>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">ID Ruta</th>
                  <th className="py-2.5 px-3">Cantidad Guías</th>
                  <th className="py-2.5 px-3 text-right">Total Facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {resumenPorRuta.map((r: any) => (
                  <tr key={r.idRuta} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 text-amber-400 font-bold">Ruta #{r.idRuta}</td>
                    <td className="py-3 px-3 text-slate-300">{r.cantidadGuias} paquetes</td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-400">
                      {formatCurrency(r.importeTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Estados */}
      {activeTab === "estados" && (
        <Card className="p-6 space-y-4">
          <CardHeader className="mb-2">
            <div>
              <CardTitle>Distribución de Guías por Estado</CardTitle>
              <CardDescription>Corte operativo y monetario por estatus del flete</CardDescription>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3">Cantidad Guías</th>
                  <th className="py-2.5 px-3 text-right">Importe Facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {guiasPorEstado.map((e: any) => (
                  <tr key={e.estado} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <StatusBadge status={e.estado} />
                    </td>
                    <td className="py-3 px-3 text-slate-100 font-bold">{e.cantidadGuias}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-100">
                      {formatCurrency(e.importeTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Desglose Individual */}
      {activeTab === "detalle" && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">No. Guía</th>
                  <th className="py-3 px-4">Sucursal Origen</th>
                  <th className="py-3 px-4">Ruta</th>
                  <th className="py-3 px-4">Peso Fact.</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Costo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {desgloseGuias.map((g: any) => (
                  <tr key={g.numeroGuia} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-amber-400 font-bold">#{g.numeroGuia}</td>
                    <td className="py-3 px-4 text-slate-200">{g.sucursalOrigen || "—"}</td>
                    <td className="py-3 px-4 text-slate-400">Ruta #{g.idRuta}</td>
                    <td className="py-3 px-4 text-slate-300">{formatWeight(g.pesoFacturableKg)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={g.estado} />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {formatCurrency(g.costoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
