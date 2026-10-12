import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guiasApi } from "@/api/guias";
import { despachoApi, ProcesarDespachoPayload } from "@/api/despacho";
import { vehiculosApi, pilotosApi, clientesApi } from "@/api/catalogos";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CapacityBar } from "@/components/ui/CapacityBar";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight, formatVolume, formatNumber } from "@/lib/utils";
import { calcularVolumenM3 } from "@/lib/calculos";
import {
  Truck,
  Package,
  AlertTriangle,
  History,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Guia } from "@/types";

export function DespachoPage() {
  const queryClient = useQueryClient();
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<number>(0);
  const [selectedPilotoId, setSelectedPilotoId] = useState<number>(0);
  const [selectedGuias, setSelectedGuias] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"nuevo" | "historial">("nuevo");

  // Load data
  const { data: guias = [], isLoading: loadingGuias } = useQuery({
    queryKey: ["guias"],
    queryFn: () => guiasApi.listar(),
  });

  const { data: vehiculos = [], isLoading: loadingVehiculos } = useQuery({
    queryKey: ["vehiculos"],
    queryFn: () => vehiculosApi.listar(),
  });

  const { data: pilotos = [] } = useQuery({
    queryKey: ["pilotos"],
    queryFn: () => pilotosApi.listar(),
  });

  const { data: despachos = [], isLoading: loadingDespachos } = useQuery({
    queryKey: ["despachos"],
    queryFn: () => despachoApi.listar(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => clientesApi.listar(),
  });

  const clientesMap = useMemo(() => {
    return new Map(clientes.map((c) => [c.id, c.nombre]));
  }, [clientes]);

  // Guides available for dispatch (Status === 'Creada')
  const guiasDisponibles = useMemo(() => {
    return guias.filter((g) => g.estado === "Creada");
  }, [guias]);

  // Selected vehicle object
  const selectedVehiculo = useMemo(() => {
    return vehiculos.find((v) => v.id === Number(selectedVehiculoId));
  }, [vehiculos, selectedVehiculoId]);

  // Calculations for selected guides
  const { totalPesoKg, totalVolumenM3 } = useMemo(() => {
    let peso = 0;
    let vol = 0;
    for (const num of selectedGuias) {
      const g = guias.find((item) => item.numeroGuia === num);
      if (g) {
        peso += (g.pesoFacturableKg || g.pesoRealKg || 0);
        vol += calcularVolumenM3(g.largoCm, g.anchoCm, g.altoCm);
      }
    }
    return {
      totalPesoKg: Number(peso.toFixed(2)),
      totalVolumenM3: Number(vol.toFixed(4)),
    };
  }, [selectedGuias, guias]);

  // Over capacity flags
  const isOverWeight = selectedVehiculo ? totalPesoKg > selectedVehiculo.capacidadPesoKg : false;
  const isOverVolume = selectedVehiculo ? totalVolumenM3 > selectedVehiculo.capacidadVolumenM3 : false;
  const isVehicleInTaller = selectedVehiculo?.estado === "En taller";
  const canDispatch =
    selectedVehiculo &&
    !isVehicleInTaller &&
    selectedGuias.length > 0 &&
    !isOverWeight &&
    !isOverVolume;

  // Toggle guide selection
  const handleToggleGuia = (num: number) => {
    setSelectedGuias((prev) =>
      prev.includes(num) ? prev.filter((id) => id !== num) : [...prev, num]
    );
  };

  const handleSelectAll = () => {
    if (selectedGuias.length === guiasDisponibles.length) {
      setSelectedGuias([]);
    } else {
      setSelectedGuias(guiasDisponibles.map((g) => g.numeroGuia));
    }
  };

  // Dispatch mutation
  const dispatchMutation = useMutation({
    mutationFn: (payload: ProcesarDespachoPayload) => despachoApi.procesar(payload),
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ["guias"] });
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      queryClient.invalidateQueries({ queryKey: ["despachos"] });
      queryClient.invalidateQueries({ queryKey: ["liquidacion"] });
      toast.success(
        `Despacho procesado exitosamente: ${resultado.totalGuias} guías asignadas al vehículo`
      );
      setSelectedGuias([]);
      setSelectedVehiculoId(0);
      setSelectedPilotoId(0);
      setActiveTab("historial");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al procesar el despacho");
    },
  });

  const handleSubmitDespacho = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehiculo) {
      toast.error("Seleccione un vehículo para el transporte");
      return;
    }
    if (isVehicleInTaller) {
      toast.error("El vehículo seleccionado está en taller y no puede ser despachado");
      return;
    }
    if (selectedGuias.length === 0) {
      toast.error("Debe seleccionar al menos una guía");
      return;
    }
    if (isOverWeight || isOverVolume) {
      toast.error("La carga excede los límites físicos del vehículo");
      return;
    }

    dispatchMutation.mutate({
      idVehiculo: Number(selectedVehiculoId),
      idPiloto: selectedPilotoId ? Number(selectedPilotoId) : undefined,
      guias: selectedGuias,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Asignación de Carga y Despacho
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algoritmo acumulativo de control de capacidad vehicular (peso y volumen).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab("nuevo")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "nuevo"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Nuevo Despacho
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "historial"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Historial ({despachos.length})
          </button>
        </div>
      </div>

      {activeTab === "nuevo" ? (
        <form onSubmit={handleSubmitDespacho} className="space-y-6">
          {/* Vehicle and Pilot configuration card */}
          <Card className="p-6">
            <CardHeader className="mb-4">
              <div>
                <CardTitle>1. Configuración de Transporte</CardTitle>
                <CardDescription>
                  Seleccione el vehículo y piloto asignados para la ruta
                </CardDescription>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Vehículo Asignado"
                value={selectedVehiculoId}
                onChange={(e) => setSelectedVehiculoId(Number(e.target.value))}
                required
              >
                <option value="0">-- Seleccione Vehículo --</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.marcaModelo} ({v.estado}) [Cap: {v.capacidadPesoKg} kg / {v.capacidadVolumenM3} m³]
                  </option>
                ))}
              </Select>

              <Select
                label="Piloto / Conductor (Opcional)"
                value={selectedPilotoId}
                onChange={(e) => setSelectedPilotoId(Number(e.target.value))}
              >
                <option value="0">-- Sin piloto asignado --</option>
                {pilotos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Lic: {p.licencia})
                  </option>
                ))}
              </Select>
            </div>

            {/* Warning if vehicle in taller */}
            {isVehicleInTaller && (
              <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs font-medium">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>
                  El vehículo seleccionado se encuentra en estado <strong>En taller</strong>. Las reglas de negocio impiden asignar despachos a unidades no operativas.
                </span>
              </div>
            )}

            {/* Live Capacity Indicators */}
            {selectedVehiculo && !isVehicleInTaller && (
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-400 uppercase tracking-wider">
                    Control de Capacidad en Tiempo Real
                  </span>
                  <span className="text-slate-400">
                    {selectedGuias.length} guías seleccionadas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <CapacityBar
                    label="Capacidad de Peso"
                    current={totalPesoKg}
                    max={selectedVehiculo.capacidadPesoKg}
                    unit="kg"
                  />
                  <CapacityBar
                    label="Capacidad de Volumen"
                    current={totalVolumenM3}
                    max={selectedVehiculo.capacidadVolumenM3}
                    unit="m³"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Pending Guides Selection Card */}
          <Card className="p-6">
            <CardHeader className="mb-4">
              <div>
                <CardTitle>2. Selección de Paquetes en Bodega</CardTitle>
                <CardDescription>
                  Marque las guías que se cargarán físicamente en el transporte
                </CardDescription>
              </div>
              {guiasDisponibles.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedGuias.length === guiasDisponibles.length ? "Desmarcar todas" : "Seleccionar todas"}
                </Button>
              )}
            </CardHeader>

            {loadingGuias ? (
              <div className="p-8 text-center text-slate-500 text-xs">Cargando guías en bodega...</div>
            ) : guiasDisponibles.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">No hay guías pendientes en bodega</p>
                <p className="text-xs text-slate-500">Todas las guías emitidas ya han sido despachadas o entregadas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3 w-10">Cargar</th>
                      <th className="py-2.5 px-3">No. Guía</th>
                      <th className="py-2.5 px-3">Remitente</th>
                      <th className="py-2.5 px-3">Destinatario</th>
                      <th className="py-2.5 px-3">Peso Fact.</th>
                      <th className="py-2.5 px-3">Volumen m³</th>
                      <th className="py-2.5 px-3">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {guiasDisponibles.map((g) => {
                      const isSelected = selectedGuias.includes(g.numeroGuia);
                      const volM3 = calcularVolumenM3(g.largoCm, g.anchoCm, g.altoCm);

                      return (
                        <tr
                          key={g.numeroGuia}
                          onClick={() => handleToggleGuia(g.numeroGuia)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-amber-500/10" : "hover:bg-slate-800/30"
                          }`}
                        >
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleGuia(g.numeroGuia)}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">
                            #{g.numeroGuia}
                          </td>
                          <td className="py-3 px-3 text-slate-200">
                            {clientesMap.get(g.idClienteRemitente) || `Cliente #${g.idClienteRemitente}`}
                          </td>
                          <td className="py-3 px-3 text-slate-200">
                            {clientesMap.get(g.idClienteDestinatario) || `Cliente #${g.idClienteDestinatario}`}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-100">
                            {formatWeight(g.pesoFacturableKg)}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            {formatVolume(volM3)}
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-emerald-400">
                            {formatCurrency(g.costoTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400">
                Resumen: <strong className="text-slate-100">{selectedGuias.length}</strong> guías ·{" "}
                <strong className="text-slate-100">{formatWeight(totalPesoKg)}</strong> ·{" "}
                <strong className="text-slate-100">{formatVolume(totalVolumenM3)}</strong>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!canDispatch}
                isLoading={dispatchMutation.isPending}
                leftIcon={<Truck className="w-5 h-5" />}
              >
                Procesar Despacho Físico
              </Button>
            </div>
          </Card>
        </form>
        ) : (
        /* Dispatch History Tab */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            {loadingDespachos ? (
              <div className="p-12 text-center text-slate-500 text-xs">Cargando historial de despachos...</div>
            ) : despachos.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Truck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No hay registros de despachos</p>
                <p className="text-xs text-slate-500">Los envíos procesados aparecerán aquí para auditoría.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">ID Despacho</th>
                    <th className="py-3 px-4">Vehículo</th>
                    <th className="py-3 px-4">Piloto</th>
                    <th className="py-3 px-4">No. Guía</th>
                    <th className="py-3 px-4">Peso Cargado</th>
                    <th className="py-3 px-4">Volumen Cargado</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium font-mono">
                  {despachos.slice().reverse().map((d) => {
                    const veh = vehiculos.find((v) => v.id === d.idVehiculo);
                    const pil = pilotos.find((p) => p.id === d.idPiloto);

                    return (
                      <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-bold">#{d.id}</td>
                        <td className="py-3 px-4 text-slate-100">
                          {veh ? `${veh.placa} (${veh.marcaModelo})` : `Vehículo #${d.idVehiculo}`}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {pil ? pil.nombre : d.idPiloto ? `Piloto #${d.idPiloto}` : "Sin piloto"}
                        </td>
                        <td className="py-3 px-4 text-amber-400 font-bold">
                          #{d.numeroGuia}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {formatWeight(d.pesoKg)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formatVolume(d.volumenM3)}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {d.fechaDespacho || "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

