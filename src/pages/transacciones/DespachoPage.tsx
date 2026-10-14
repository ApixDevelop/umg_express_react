import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guiasApi } from "@/api/guias";
import { despachoApi, ProcesarDespachoPayload } from "@/api/despacho";
import { vehiculosApi, pilotosApi, clientesApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CapacityBar } from "@/components/ui/CapacityBar";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight, formatVolume } from "@/lib/utils";
import { calcularVolumenM3 } from "@/lib/calculos";
import { Truck, CheckSquare, Square, AlertTriangle, ShieldCheck, History, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

export function DespachoPage() {
  const queryClient = useQueryClient();
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<number>(0);
  const [selectedPilotoId, setSelectedPilotoId] = useState<number>(0);
  const [selectedGuias, setSelectedGuias] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"nuevo" | "historial">("nuevo");

  const { data: guias = [], isLoading: loadingGuias } = useQuery({
    queryKey: ["guias"],
    queryFn: () => guiasApi.listar(),
  });

  const { data: vehiculos = [] } = useQuery({
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

  const clientesMap = useMemo(() => new Map(clientes.map((c) => [c.id, c.nombre])), [clientes]);

  const guiasDisponibles = useMemo(() => {
    return guias.filter((g) => g.estado === "Creada");
  }, [guias]);

  const selectedVehiculo = useMemo(() => {
    return vehiculos.find((v) => v.id === Number(selectedVehiculoId));
  }, [vehiculos, selectedVehiculoId]);

  // Totales acumulados
  const { totalPesoKg, totalVolumenM3 } = useMemo(() => {
    let peso = 0;
    let volumen = 0;
    for (const num of selectedGuias) {
      const g = guiasDisponibles.find((x) => x.numeroGuia === num);
      if (g) {
        peso += g.pesoFacturableKg;
        volumen += calcularVolumenM3(g.largoCm, g.anchoCm, g.altoCm);
      }
    }
    return { totalPesoKg: peso, totalVolumenM3: volumen };
  }, [selectedGuias, guiasDisponibles]);

  // Validaciones físicas
  const maxPeso = selectedVehiculo?.capacidadPesoKg || 0;
  const maxVolumen = selectedVehiculo?.capacidadVolumenM3 || 0;

  const isWeightOver = maxPeso > 0 && totalPesoKg > maxPeso;
  const isVolumeOver = maxVolumen > 0 && totalVolumenM3 > maxVolumen;
  const hasVehicle = Boolean(selectedVehiculoId && selectedVehiculo);
  const canDispatch =
    hasVehicle &&
    selectedPilotoId > 0 &&
    selectedGuias.length > 0 &&
    !isWeightOver &&
    !isVolumeOver &&
    selectedVehiculo?.estado === "Disponible";

  // Mutación
  const dispatchMutation = useMutation({
    mutationFn: (payload: ProcesarDespachoPayload) => despachoApi.procesar(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["guias"] });
      queryClient.invalidateQueries({ queryKey: ["despachos"] });
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      queryClient.invalidateQueries({ queryKey: ["liquidacion"] });

      toast.success("Despacho de " + (data.totalGuias || selectedGuias.length) + " guías procesado exitosamente");
      setSelectedGuias([]);
      setSelectedVehiculoId(0);
      setSelectedPilotoId(0);
      setActiveTab("historial");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al procesar el despacho vehicular");
    },
  });

  const handleToggleGuia = (numeroGuia: number) => {
    setSelectedGuias((prev) =>
      prev.includes(numeroGuia) ? prev.filter((id) => id !== numeroGuia) : [...prev, numeroGuia]
    );
  };

  const handleSelectAll = () => {
    if (selectedGuias.length === guiasDisponibles.length) {
      setSelectedGuias([]);
    } else {
      setSelectedGuias(guiasDisponibles.map((g) => g.numeroGuia));
    }
  };

  const handleDespachar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDispatch) return;

    dispatchMutation.mutate({
      idVehiculo: Number(selectedVehiculoId),
      idPiloto: Number(selectedPilotoId),
      guias: selectedGuias,
    });
  };

  return (
    <div className="space-y-4">
      {/* Cabecera y Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-text tracking-tight">Asignación y despacho de carga</h1>
          <p className="text-[12px] text-text-muted mt-0.5">
            Consolidación de paquetes en bodega y control riguroso de capacidad física vehicular.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-surface rounded-control border border-border">
          <button
            onClick={() => setActiveTab("nuevo")}
            className={"px-3 py-1 rounded text-xs font-medium cursor-pointer transition-all active:scale-[0.97] " + (
              activeTab === "nuevo"
                ? "bg-accent text-on-accent shadow-sm"
                : "text-text-muted hover:text-text"
            )}
          >
            Nuevo Despacho
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={"px-3 py-1 rounded text-xs font-medium cursor-pointer transition-all active:scale-[0.97] flex items-center gap-1 " + (
              activeTab === "historial"
                ? "bg-accent text-on-accent shadow-sm"
                : "text-text-muted hover:text-text"
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial ({despachos.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "nuevo" ? (
        <form onSubmit={handleDespachar} className="space-y-4">
          {/* BAHÍA DE CARGA: Asignación de Vehículo y Piloto */}
          <div className="rounded-panel border border-border bg-surface p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <Truck className="w-4 h-4 text-accent" />
              <h2 className="text-[14px] font-semibold text-text">Bahía de transporte</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Vehículo de transporte"
                value={selectedVehiculoId}
                onChange={(e) => setSelectedVehiculoId(Number(e.target.value))}
                required
              >
                <option value="0">-- Seleccione vehículo disponible --</option>
                {vehiculos.map((v) => (
                  <option
                    key={v.id}
                    value={v.id}
                    disabled={v.estado !== "Disponible"}
                  >
                    {v.placa + " (" + v.marcaModelo + ") - " + v.estado + " [Max: " + formatWeight(v.capacidadPesoKg) + " / " + formatVolume(v.capacidadVolumenM3) + "]"}
                  </option>
                ))}
              </Select>

              <Select
                label="Piloto asignado"
                value={selectedPilotoId}
                onChange={(e) => setSelectedPilotoId(Number(e.target.value))}
                required
              >
                <option value="0">-- Seleccione piloto con licencia --</option>
                {pilotos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre + " (Lic: " + p.licencia + ")"}
                  </option>
                ))}
              </Select>
            </div>

            {/* RADAR DE CAPACIDAD FÍSICA VEHICULAR */}
            {selectedVehiculo ? (
              <div className="p-3.5 rounded bg-bg/50 border border-border space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text">
                    Vehículo {selectedVehiculo.placa} ({selectedVehiculo.marcaModelo})
                  </span>
                  <StatusBadge status={selectedVehiculo.estado} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CapacityBar
                    label="Ocupación de peso (Báscula)"
                    current={totalPesoKg}
                    max={maxPeso}
                    unit="kg"
                  />
                  <CapacityBar
                    label="Ocupación de volumen (Espacio cúbico)"
                    current={totalVolumenM3}
                    max={maxVolumen}
                    unit="m³"
                  />
                </div>

                {(isWeightOver || isVolumeOver) && (
                  <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/40 text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Sobrecarga detectada. No es posible despachar porque supera los límites físicos del vehículo.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded bg-bg/40 border border-border/70 text-xs text-text-muted flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-text-faint" />
                <span>Seleccione un vehículo para habilitar el radar de peso y cubicaje.</span>
              </div>
            )}
          </div>

          {/* CHECKLIST DE GUÍAS DISPONIBLES EN BODEGA */}
          <div className="rounded-panel border border-border bg-surface overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between bg-surface-hover/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text">Guías pendientes en bodega</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                  {guiasDisponibles.length} disponibles
                </span>
              </div>

              {guiasDisponibles.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-accent hover:underline cursor-pointer flex items-center gap-1 active:scale-[0.97] transition-all"
                >
                  {selectedGuias.length === guiasDisponibles.length ? (
                    <>
                      <Square className="w-3.5 h-3.5" /> Deseleccionar todas
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" /> Seleccionar todas
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              {loadingGuias ? (
                <div className="p-8 text-center text-text-muted text-[13px]">Consultando inventario de bodega...</div>
              ) : guiasDisponibles.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-[13px] space-y-2">
                  <Truck className="w-8 h-8 text-text-faint mx-auto opacity-50" />
                  <p>No hay guías pendientes en bodega para despachar en este momento.</p>
                </div>
              ) : (
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-muted text-[12px] font-medium bg-surface-hover/20">
                      <th className="py-2.5 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={selectedGuias.length === guiasDisponibles.length && guiasDisponibles.length > 0}
                          onChange={handleSelectAll}
                          className="rounded-control border-border-input bg-surface text-accent cursor-pointer"
                        />
                      </th>
                      <th className="py-2 px-3 font-medium">No. guía</th>
                      <th className="py-2 px-3 font-medium">Remitente</th>
                      <th className="py-2 px-3 font-medium">Destinatario</th>
                      <th className="py-2 px-3 text-right font-medium">Peso Facturable</th>
                      <th className="py-2 px-3 text-right font-medium">Volumen</th>
                      <th className="py-2 px-3 text-right font-medium">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {guiasDisponibles.map((g) => {
                      const isSelected = selectedGuias.includes(g.numeroGuia);
                      const volM3 = calcularVolumenM3(g.largoCm, g.anchoCm, g.altoCm);

                      return (
                        <tr
                          key={g.numeroGuia}
                          onClick={() => handleToggleGuia(g.numeroGuia)}
                          className={"cursor-pointer transition-colors h-10 " + (
                            isSelected ? "bg-accent/10 border-l-2 border-accent" : "hover:bg-surface-hover/60"
                          )}
                        >
                          <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleGuia(g.numeroGuia)}
                              className="rounded-control border-border-input bg-surface text-accent cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 font-medium text-text tabular-nums">
                            #{g.numeroGuia}
                          </td>
                          <td className="py-2 px-3 text-text truncate max-w-[140px]">
                            {clientesMap.get(g.idClienteRemitente) || ("#" + g.idClienteRemitente)}
                          </td>
                          <td className="py-2 px-3 text-text truncate max-w-[140px]">
                            {clientesMap.get(g.idClienteDestinatario) || ("#" + g.idClienteDestinatario)}
                          </td>
                          <td className="py-2 px-3 text-right text-text font-medium tabular-nums">
                            {formatWeight(g.pesoFacturableKg)}
                          </td>
                          <td className="py-2 px-3 text-right text-text-muted tabular-nums text-xs">
                            {volM3.toFixed(4)} m³
                          </td>
                          <td className="py-2 px-3 text-right text-text tabular-nums">
                            {formatCurrency(g.costoTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Barra de Consolidación y Botón Primario */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border bg-surface-hover/20">
              <div className="text-xs text-text-muted tabular-nums">
                Seleccionadas: <span className="text-text font-bold text-sm">{selectedGuias.length}</span> guías ·{" "}
                Peso total: <span className="text-text font-semibold">{formatWeight(totalPesoKg)}</span> ·{" "}
                Volumen total: <span className="text-text font-semibold">{formatVolume(totalVolumenM3)}</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!canDispatch}
                isLoading={dispatchMutation.isPending}
                leftIcon={<Truck className="w-3.5 h-3.5" />}
              >
                Confirmar y despachar carga
              </Button>
            </div>
          </div>
        </form>
      ) : (
        /* Pestaña Historial de Despachos */
        <div className="rounded-panel border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            {loadingDespachos ? (
              <div className="p-8 text-center text-text-muted text-[13px]">Cargando historial de despachos...</div>
            ) : despachos.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-text-muted">
                No hay registros de despachos previos en el sistema.
              </div>
            ) : (
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-muted text-[12px] font-medium bg-surface-hover/30">
                    <th className="py-2.5 px-3 font-medium">ID Despacho</th>
                    <th className="py-2.5 px-3 font-medium">Vehículo</th>
                    <th className="py-2.5 px-3 font-medium">Piloto</th>
                    <th className="py-2.5 px-3 font-medium">No. guía</th>
                    <th className="py-2.5 px-3 text-right font-medium">Peso transportado</th>
                    <th className="py-2.5 px-3 text-right font-medium">Volumen</th>
                    <th className="py-2.5 px-3 text-right font-medium">Fecha</th>
                    <th className="py-2.5 px-3 text-right font-medium">Manifiesto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {despachos.slice().reverse().map((d) => {
                    const veh = vehiculos.find((v) => v.id === d.idVehiculo);
                    const pil = pilotos.find((p) => p.id === d.idPiloto);

                    return (
                      <tr key={d.id} className="hover:bg-surface-hover/60 transition-colors h-10 group">
                        <td className="py-2 px-3 text-accent font-semibold tabular-nums">#{d.id}</td>
                        <td className="py-2 px-3 text-text font-medium">
                          {veh ? (veh.placa + " (" + veh.marcaModelo + ")") : ("Vehículo #" + d.idVehiculo)}
                        </td>
                        <td className="py-2 px-3 text-text-muted">
                          {pil ? pil.nombre : d.idPiloto ? ("Piloto #" + d.idPiloto) : "Sin piloto"}
                        </td>
                        <td className="py-2 px-3 text-text tabular-nums">
                          #{d.numeroGuia}
                        </td>
                        <td className="py-2 px-3 text-right text-text tabular-nums">
                          {formatWeight(d.pesoKg)}
                        </td>
                        <td className="py-2 px-3 text-right text-text-muted tabular-nums text-xs">
                          {formatVolume(d.volumenM3)}
                        </td>
                        <td className="py-2 px-3 text-right text-text-muted text-xs">
                          {d.fechaDespacho || "N/A"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <Link
                            to={"/manifiesto?vehiculo=" + d.idVehiculo}
                            title="Ver manifiesto de vehículo"
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            <span>Ver</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
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
