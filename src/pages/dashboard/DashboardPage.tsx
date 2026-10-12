import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { guiasApi } from "@/api/guias";
import { vehiculosApi } from "@/api/catalogos";
import { reportesApi } from "@/api/reportes";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatWeight } from "@/lib/utils";
import {
  Package,
  Truck,
  DollarSign,
  Box,
  PlusCircle,
  Search,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { Guia, Vehiculo } from "@/types";

export function DashboardPage() {
  const { user } = useAuthStore();

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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800/80 shadow-2xl">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500 font-mono">
            Centro de Operaciones
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
            Hola, {user?.nombre || user?.username} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Control de envíos interdepartamentales, asignación de despachos y auditoría de carga UMG Express.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/guias">
            <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Nueva Guía
            </Button>
          </Link>
          <Link to="/despacho">
            <Button variant="secondary" size="md" leftIcon={<Truck className="w-4 h-4" />}>
              Despachar
            </Button>
          </Link>
          <Link to="/rastreo">
            <Button variant="outline" size="md" leftIcon={<Search className="w-4 h-4" />}>
              Rastrear
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Guías Emitidas"
          value={totalGuias}
          subtitle={`${entregadas} entregadas`}
          icon={<Package className="w-5 h-5 text-amber-500" />}
          colorAccent="amber"
        />
        <StatCard
          title="En Bodega (Pendientes)"
          value={enBodega}
          subtitle="Listas para despacho"
          icon={<Box className="w-5 h-5 text-indigo-400" />}
          colorAccent="indigo"
        />
        <StatCard
          title="En Tránsito (Ruta)"
          value={enTransito}
          subtitle="Cargadas en vehículos"
          icon={<Truck className="w-5 h-5 text-blue-400" />}
          colorAccent="blue"
        />
        <StatCard
          title="Total Facturado"
          value={formatCurrency(totalFacturado)}
          subtitle="Consolidado financiero"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          colorAccent="emerald"
        />
      </div>

      {/* Two-column layout: Recent Guides & Fleet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Guides (Takes 2 cols) */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>Guías Recientes</CardTitle>
                <CardDescription>Últimos envíos registrados en el sistema</CardDescription>
              </div>
              <Link to="/guias">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Ver todas
                </Button>
              </Link>
            </CardHeader>

            <div className="flex-1 overflow-x-auto">
              {loadingGuias ? (
                <div className="p-8 text-center text-slate-500 text-sm">Cargando guías...</div>
              ) : guias.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Aún no se han emitido guías</p>
                  <Link to="/guias">
                    <Button variant="outline" size="sm">Emitir primera guía</Button>
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">No. Guía</th>
                      <th className="py-2.5 px-3">Peso Facturable</th>
                      <th className="py-2.5 px-3">Costo Total</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {guias.slice(-5).reverse().map((g) => (
                      <tr key={g.numeroGuia} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">
                          #{g.numeroGuia}
                        </td>
                        <td className="py-3 px-3 text-slate-200">
                          {formatWeight(g.pesoFacturableKg)}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-100">
                          {formatCurrency(g.costoTotal)}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={g.estado} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/rastreo?no=${g.numeroGuia}`}
                            className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors gap-1"
                          >
                            Rastrear <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Fleet Status (Takes 1 col) */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>Flota Vehicular</CardTitle>
                <CardDescription>
                  {vehiculosDisponibles} de {vehiculos.length} unidades disponibles
                </CardDescription>
              </div>
              <Link to="/catalogos/vehiculos">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Gestión
                </Button>
              </Link>
            </CardHeader>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingVehiculos ? (
                <div className="p-8 text-center text-slate-500 text-sm">Cargando flota...</div>
              ) : vehiculos.length === 0 ? (
                <p className="text-center text-slate-500 text-xs py-8">No hay vehículos registrados</p>
              ) : (
                vehiculos.slice(0, 5).map((v: Vehiculo) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-100">{v.placa}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[130px]">{v.marcaModelo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={v.estado} />
                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        {v.capacidadPesoKg} kg / {v.capacidadVolumenM3} m³
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
