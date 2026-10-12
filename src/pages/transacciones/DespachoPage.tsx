import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guiasApi } from "@/api/guias";
import { despachoApi, ProcesarDespachoPayload } from "@/api/despacho";
import { vehiculosApi, pilotosApi, clientesApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CapacityBar } from "@/components/ui/CapacityBar";
import { formatCurrency, formatWeight, formatVolume } from "@/lib/utils";
import { calcularVolumenM3 } from "@/lib/calculos";
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
        `Despacho procesado: ${resultado.totalGuias} guías asignadas al vehículo`
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
      toast.error("El vehículo seleccionado está en taller");
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
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Asignación de Carga</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Asignación de guías en bodega a unidades de transporte y control de capacidad
          </p>
        </div>

        {/* Pestañas sobrias */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab("nuevo")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "nuevo"
                ? "bg-slate-800 text-slate-100 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Nuevo despacho
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "historial"
                ? "bg-slate-800 text-slate-100 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Historial ({despachos.length})
          </button>
        </div>
      </div>

      {activeTab === "nuevo" ? (
        <form onSubmit={handleSubmitDespacho} className="space-y-4">
          {/* Configuración de transporte */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-4 space-y-3">
            <h2 className="text-xs font-medium text-slate-300">Transporte y piloto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Vehículo asignado"
                value={selectedVehiculoId}
                onChange={(e) => setSelectedVehiculoId(Number(e.target.value))}
                required
              >
                <option value="0">-- Seleccione vehículo --</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} - {v.marcaModelo} ({v.estado}) [Cap: {v.capacidadPesoKg} kg / {v.capacidadVolumenM3} m³]
                  </option>
                ))}
              </Select>

              <Select
                label="Piloto asignado"
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

            {isVehicleInTaller && (
              <p className="text-xs text-rose-400">
                El vehículo seleccionado está en taller y no puede recibir carga.
              </p>
            )}

            {/* Capacidad en tiempo real */}
            {selectedVehiculo && !isVehicleInTaller && (
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                <CapacityBar
                  label="Capacidad de peso"
                  current={totalPesoKg}
                  max={selectedVehiculo.capacidadPesoKg}
                  unit="kg"
                />
                <CapacityBar
                  label="Capacidad de volumen"
                  current={totalVolumenM3}
                  max={selectedVehiculo.capacidadVolumenM3}
                  unit="m³"
                />
              </div>
            )}
          </div>

          {/* Tabla densa con selección de guías */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div>
                <h2 className="text-xs font-medium text-slate-300">Guías pendientes en bodega</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Seleccione las guías que se cargarán en la unidad
                </p>
              </div>
              {guiasDisponibles.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium cursor-pointer"
                >
                  {selectedGuias.length === guiasDisponibles.length ? "Desmarcar todas" : "Seleccionar todas"}
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              {loadingGuias ? (
                <div className="p-8 text-center text-slate-500 text-xs">Cargando guías en bodega...</div>
              ) : guiasDisponibles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No hay guías pendientes en bodega para despachar.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedGuias.length === guiasDisponibles.length && guiasDisponibles.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3">No. guía</th>
                      <th className="py-2.5 px-3">Remitente</th>
                      <th className="py-2.5 px-3">Destinatario</th>
                      <th className="py-2.5 px-3">Peso fact.</th>
                      <th className="py-2.5 px-3">Volumen m³</th>
                      <th className="py-2.5 px-3 text-right">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {guiasDisponibles.map((g) => {
                      const isSelected = selectedGuias.includes(g.numeroGuia);
                      const volM3 = calcularVolumenM3(g.largoCm, g.anchoCm, g.altoCm);

                      return (
                        <tr
                          key={g.numeroGuia}
                          onClick={() => handleToggleGuia(g.numeroGuia)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-slate-800/50" : "hover:bg-slate-900/40"
                          }`}
                        >
                          <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleGuia(g.numeroGuia)}
                              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono font-medium text-slate-200">
                            {g.numeroGuia}
                          </td>
                          <td className="py-2 px-3 text-slate-300 truncate max-w-[150px]">
                            {clientesMap.get(g.idClienteRemitente) || `#${g.idClienteRemitente}`}
                          </td>
                          <td className="py-2 px-3 text-slate-300 truncate max-w-[150px]">
                            {clientesMap.get(g.idClienteDestinatario) || `#${g.idClienteDestinatario}`}
                          </td>
                          <td className="py-2 px-3 text-slate-300 tabular-nums">
                            {formatWeight(g.pesoFacturableKg)}
                          </td>
                          <td className="py-2 px-3 text-slate-400 tabular-nums">
                            {volM3.toFixed(4)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-300 tabular-nums">
                            {formatCurrency(g.costoTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Acción primaria única al pie con resumen */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-800 bg-[#0b1120]">
              <div className="text-xs text-slate-400 tabular-nums">
                Selección: <span className="font-medium text-slate-200">{selectedGuias.length}</span> guías ·{" "}
                <span className="font-medium text-slate-200">{formatWeight(totalPesoKg)}</span> ·{" "}
                <span className="font-medium text-slate-200">{formatVolume(totalVolumenM3)}</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!canDispatch}
                isLoading={dispatchMutation.isPending}
              >
                Despachar carga
              </Button>
            </div>
          </div>
        </form>
      ) : (
        /* Pestaña Historial */
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
          <div className="overflow-x-auto">
            {loadingDespachos ? (
              <div className="p-8 text-center text-slate-500 text-xs">Cargando despachos...</div>
            ) : despachos.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No hay despachos registrados en el historial.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Vehículo</th>
                    <th className="py-2.5 px-3">Piloto</th>
                    <th className="py-2.5 px-3">No. guía</th>
                    <th className="py-2.5 px-3">Peso</th>
                    <th className="py-2.5 px-3">Volumen</th>
                    <th className="py-2.5 px-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {despachos.slice().reverse().map((d) => {
                    const veh = vehiculos.find((v) => v.id === d.idVehiculo);
                    const pil = pilotos.find((p) => p.id === d.idPiloto);

                    return (
                      <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2 px-3 text-slate-400 font-mono">#{d.id}</td>
                        <td className="py-2 px-3 text-slate-200">
                          {veh ? `${veh.placa} (${veh.marcaModelo})` : `Vehículo #${d.idVehiculo}`}
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          {pil ? pil.nombre : d.idPiloto ? `Piloto #${d.idPiloto}` : "Sin piloto"}
                        </td>
                        <td className="py-2 px-3 text-slate-200 font-mono">
                          {d.numeroGuia}
                        </td>
                        <td className="py-2 px-3 text-slate-300 tabular-nums">
                          {formatWeight(d.pesoKg)}
                        </td>
                        <td className="py-2 px-3 text-slate-400 tabular-nums">
                          {formatVolume(d.volumenM3)}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {d.fechaDespacho || "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
