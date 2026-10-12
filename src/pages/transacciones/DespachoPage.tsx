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

  const clientesMap = useMemo(() => {
    return new Map(clientes.map((c) => [c.id, c.nombre]));
  }, [clientes]);

  const guiasDisponibles = useMemo(() => {
    return guias.filter((g) => g.estado === "Creada");
  }, [guias]);

  const selectedVehiculo = useMemo(() => {
    return vehiculos.find((v) => v.id === Number(selectedVehiculoId));
  }, [vehiculos, selectedVehiculoId]);

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

  const dispatchMutation = useMutation({
    mutationFn: (payload: ProcesarDespachoPayload) => despachoApi.procesar(payload),
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ["guias"] });
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      queryClient.invalidateQueries({ queryKey: ["despachos"] });
      queryClient.invalidateQueries({ queryKey: ["liquidacion"] });
      toast.success(`Despacho procesado: ${resultado.totalGuias} guías asignadas`);
      setSelectedGuias([]);
      setSelectedVehiculoId(0);
      setSelectedPilotoId(0);
      setActiveTab("historial");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al procesar despacho");
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
      toast.error("La carga excede la capacidad física del vehículo");
      return;
    }

    dispatchMutation.mutate({
      idVehiculo: Number(selectedVehiculoId),
      idPiloto: selectedPilotoId ? Number(selectedPilotoId) : undefined,
      guias: selectedGuias,
    });
  };

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text">Asignación de carga</h1>

        <div className="flex items-center gap-1 border border-border rounded-panel p-0.5 bg-surface text-[12px]">
          <button
            onClick={() => setActiveTab("nuevo")}
            className={`px-2.5 py-1 rounded-control transition-colors cursor-pointer ${
              activeTab === "nuevo"
                ? "bg-surface-hover text-text font-medium"
                : "text-text-muted hover:text-text"
            }`}
          >
            Nuevo despacho
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`px-2.5 py-1 rounded-control transition-colors cursor-pointer ${
              activeTab === "historial"
                ? "bg-surface-hover text-text font-medium"
                : "text-text-muted hover:text-text"
            }`}
          >
            Historial ({despachos.length})
          </button>
        </div>
      </div>

      {activeTab === "nuevo" ? (
        <form onSubmit={handleSubmitDespacho} className="space-y-4">
          {/* Panel de configuración de transporte */}
          <div className="rounded-panel border border-border bg-surface p-4 space-y-3">
            <h2 className="text-[14px] font-semibold text-text">Transporte y piloto</h2>
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
              <p className="text-[12px] text-danger">
                El vehículo seleccionado está en taller y no puede recibir carga.
              </p>
            )}

            {selectedVehiculo && !isVehicleInTaller && (
              <div className="pt-3 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Tabla densa de selección de paquetes */}
          <div className="rounded-panel border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-[14px] font-semibold text-text">Guías pendientes en bodega</h2>
              {guiasDisponibles.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[12px] text-text-muted hover:text-text cursor-pointer"
                >
                  {selectedGuias.length === guiasDisponibles.length ? "Desmarcar todas" : "Seleccionar todas"}
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              {loadingGuias ? (
                <div className="p-6 text-center text-text-muted text-[13px]">Cargando guías en bodega...</div>
              ) : guiasDisponibles.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-text-muted">
                  No hay guías pendientes en bodega para despachar.
                </div>
              ) : (
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                      <th className="py-2 px-3 w-8 text-center">
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
                      <th className="py-2 px-3 text-right font-medium">Peso (kg)</th>
                      <th className="py-2 px-3 text-right font-medium">Volumen (m³)</th>
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
                          className={`cursor-pointer transition-colors h-10 ${
                            isSelected ? "bg-surface-hover" : "hover:bg-surface-hover/50"
                          }`}
                        >
                          <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleGuia(g.numeroGuia)}
                              className="rounded-control border-border-input bg-surface text-accent cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 text-text tabular-nums">
                            {g.numeroGuia}
                          </td>
                          <td className="py-2 px-3 text-text truncate max-w-[140px]">
                            {clientesMap.get(g.idClienteRemitente) || `#${g.idClienteRemitente}`}
                          </td>
                          <td className="py-2 px-3 text-text truncate max-w-[140px]">
                            {clientesMap.get(g.idClienteDestinatario) || `#${g.idClienteDestinatario}`}
                          </td>
                          <td className="py-2 px-3 text-right text-text tabular-nums">
                            {formatWeight(g.pesoFacturableKg)}
                          </td>
                          <td className="py-2 px-3 text-right text-text-muted tabular-nums">
                            {volM3.toFixed(4)}
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

            {/* Acción primaria única al pie */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border bg-surface">
              <div className="text-[12px] text-text-muted tabular-nums">
                Seleccionadas: <span className="text-text font-medium">{selectedGuias.length}</span> guías ·{" "}
                <span className="text-text font-medium">{formatWeight(totalPesoKg)}</span> ·{" "}
                <span className="text-text font-medium">{formatVolume(totalVolumenM3)}</span>
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
        <div className="rounded-panel border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            {loadingDespachos ? (
              <div className="p-6 text-center text-text-muted text-[13px]">Cargando historial...</div>
            ) : despachos.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-text-muted">
                No hay registros de despachos.
              </div>
            ) : (
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                    <th className="py-2 px-3 font-medium">ID</th>
                    <th className="py-2 px-3 font-medium">Vehículo</th>
                    <th className="py-2 px-3 font-medium">Piloto</th>
                    <th className="py-2 px-3 font-medium">No. guía</th>
                    <th className="py-2 px-3 text-right font-medium">Peso (kg)</th>
                    <th className="py-2 px-3 text-right font-medium">Volumen (m³)</th>
                    <th className="py-2 px-3 text-right font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {despachos.slice().reverse().map((d) => {
                    const veh = vehiculos.find((v) => v.id === d.idVehiculo);
                    const pil = pilotos.find((p) => p.id === d.idPiloto);

                    return (
                      <tr key={d.id} className="hover:bg-surface-hover transition-colors h-10">
                        <td className="py-2 px-3 text-text-muted tabular-nums">#{d.id}</td>
                        <td className="py-2 px-3 text-text">
                          {veh ? `${veh.placa} (${veh.marcaModelo})` : `Vehículo #${d.idVehiculo}`}
                        </td>
                        <td className="py-2 px-3 text-text-muted">
                          {pil ? pil.nombre : d.idPiloto ? `Piloto #${d.idPiloto}` : "Sin piloto"}
                        </td>
                        <td className="py-2 px-3 text-text tabular-nums">
                          {d.numeroGuia}
                        </td>
                        <td className="py-2 px-3 text-right text-text tabular-nums">
                          {formatWeight(d.pesoKg)}
                        </td>
                        <td className="py-2 px-3 text-right text-text-muted tabular-nums">
                          {formatVolume(d.volumenM3)}
                        </td>
                        <td className="py-2 px-3 text-right text-text-muted text-[12px]">
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