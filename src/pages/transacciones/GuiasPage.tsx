import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { guiasApi, CrearGuiaPayload } from "@/api/guias";
import { clientesApi, rutasApi, sucursalesApi, tarifasApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatWeight } from "@/lib/utils";
import {
  calcularPesoVolumetrico,
  calcularVolumenM3,
  calcularPesoFacturable,
  calcularCostoEstimado,
} from "@/lib/calculos";
import { Search, Printer, Plus, Package, ArrowRight, Scale } from "lucide-react";
import { toast } from "sonner";
import type { Guia } from "@/types";

export function GuiasPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdGuiaModal, setCreatedGuiaModal] = useState<Guia | null>(null);

  // Form state
  const [idRemitente, setIdRemitente] = useState<number>(0);
  const [idDestinatario, setIdDestinatario] = useState<number>(0);
  const [idRuta, setIdRuta] = useState<number>(0);
  const [idTarifa, setIdTarifa] = useState<number>(0);
  const [pesoReal, setPesoReal] = useState<number | string>(1);
  const [largo, setLargo] = useState<number | string>(20);
  const [ancho, setAncho] = useState<number | string>(15);
  const [alto, setAlto] = useState<number | string>(10);

  // Queries
  const { data: guias = [], isLoading: loadingGuias } = useQuery({
    queryKey: ["guias"],
    queryFn: () => guiasApi.listar(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => clientesApi.listar(),
  });

  const { data: rutas = [] } = useQuery({
    queryKey: ["rutas"],
    queryFn: () => rutasApi.listar(),
  });

  const { data: sucursales = [] } = useQuery({
    queryKey: ["sucursales"],
    queryFn: () => sucursalesApi.listar(),
  });

  const { data: tarifas = [] } = useQuery({
    queryKey: ["tarifas"],
    queryFn: () => tarifasApi.listar(),
  });

  const clientesMap = useMemo(() => new Map(clientes.map((c) => [c.id, c.nombre])), [clientes]);
  const sucursalesMap = useMemo(() => new Map(sucursales.map((s) => [s.id, s.nombre])), [sucursales]);

  // Reactive volumetric & cost calculation for the modal cockpit
  const selectedTarifa = useMemo(() => tarifas.find((t) => t.id === Number(idTarifa)), [tarifas, idTarifa]);
  const selectedRuta = useMemo(() => rutas.find((r) => r.id === Number(idRuta)), [rutas, idRuta]);

  const numLargo = Number(largo) || 0;
  const numAncho = Number(ancho) || 0;
  const numAlto = Number(alto) || 0;
  const numPesoReal = Number(pesoReal) || 0;

  const livePesoVolumetrico = useMemo(() => calcularPesoVolumetrico(numLargo, numAncho, numAlto), [numLargo, numAncho, numAlto]);
  const liveVolumenM3 = useMemo(() => calcularVolumenM3(numLargo, numAncho, numAlto), [numLargo, numAncho, numAlto]);
  const livePesoFacturable = useMemo(() => calcularPesoFacturable(numPesoReal, livePesoVolumetrico), [numPesoReal, livePesoVolumetrico]);
  const isVolumetricGreater = livePesoVolumetrico > numPesoReal;

  const liveCostoEstimado = useMemo(() => {
    return calcularCostoEstimado(selectedRuta?.tarifaBase || 0, livePesoFacturable, liveVolumenM3, selectedTarifa);
  }, [livePesoFacturable, liveVolumenM3, selectedTarifa, selectedRuta]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      todos: guias.length,
      creadas: guias.filter((g) => g.estado === "Creada").length,
      despachadas: guias.filter((g) => g.estado === "Despachada").length,
      entregadas: guias.filter((g) => g.estado === "Entregada").length,
    };
  }, [guias]);

  // Filtered list
  const filteredGuias = useMemo(() => {
    return guias.filter((g) => {
      const matchEstado = filterEstado === "TODOS" || g.estado === filterEstado;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchEstado;

      const numStr = g.numeroGuia.toString();
      const remitente = (clientesMap.get(g.idClienteRemitente) || "").toLowerCase();
      const destinatario = (clientesMap.get(g.idClienteDestinatario) || "").toLowerCase();

      return matchEstado && (numStr.includes(term) || remitente.includes(term) || destinatario.includes(term));
    });
  }, [guias, filterEstado, searchTerm, clientesMap]);

  // Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CrearGuiaPayload) => guiasApi.crear(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["guias"] });
      queryClient.invalidateQueries({ queryKey: ["liquidacion"] });
      toast.success("Guía #" + data.numeroGuia + " emitida exitosamente");
      setIsModalOpen(false);
      setCreatedGuiaModal(data);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al emitir guía");
    },
  });

  const resetForm = () => {
    setIdRemitente(0);
    setIdDestinatario(0);
    setIdRuta(0);
    setIdTarifa(0);
    setPesoReal(1);
    setLargo(20);
    setAncho(15);
    setAlto(10);
  };

  const handleCrearGuia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idRemitente || !idDestinatario || !idRuta) {
      toast.error("Seleccione remitente, destinatario y ruta");
      return;
    }
    if (idRemitente === idDestinatario) {
      toast.error("El remitente y el destinatario no pueden ser el mismo cliente");
      return;
    }
    const pReal = Number(pesoReal) || 0;
    const lCm = Number(largo) || 0;
    const aCm = Number(ancho) || 0;
    const hCm = Number(alto) || 0;

    if (pReal <= 0 || lCm <= 0 || aCm <= 0 || hCm <= 0) {
      toast.error("Las medidas y peso deben ser mayores a 0");
      return;
    }

    createMutation.mutate({
      idClienteRemitente: Number(idRemitente),
      idClienteDestinatario: Number(idDestinatario),
      idRuta: Number(idRuta),
      idTarifa: Number(idTarifa) || undefined,
      pesoRealKg: pReal,
      largoCm: lCm,
      anchoCm: aCm,
      altoCm: hCm,
    });
  };

  return (
    <div className="space-y-4">
      {/* Cabecera y botón primario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-text tracking-tight">Emisión de guías</h1>
          <p className="text-[12px] text-text-muted mt-0.5">
            Registro, cálculo volumétrico en tiempo real y tarificación de paquetes.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          Nueva guía
        </Button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-panel border border-border bg-surface p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Pills de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "TODOS", label: "Todas", count: counts.todos },
            { key: "Creada", label: "En bodega", count: counts.creadas },
            { key: "Despachada", label: "En tránsito", count: counts.despachadas },
            { key: "Entregada", label: "Entregadas", count: counts.entregadas },
          ].map((pill) => (
            <button
              key={pill.key}
              onClick={() => setFilterEstado(pill.key)}
              className={"h-7 px-2.5 rounded-control text-xs font-medium cursor-pointer transition-all duration-150 active:scale-[0.97] flex items-center gap-1.5 " + (
                filterEstado === pill.key
                  ? "bg-accent text-on-accent shadow-sm"
                  : "bg-surface-hover text-text-muted hover:text-text hover:bg-border"
              )}
            >
              <span>{pill.label}</span>
              <span className={"text-[10px] px-1 py-0.2 rounded " + (filterEstado === pill.key ? "bg-black/20" : "bg-bg/60")}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por no. o cliente..."
            className="w-full h-8 bg-surface text-text placeholder:text-text-faint text-xs rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
          />
        </div>
      </div>

      {/* Tabla de Guías */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {loadingGuias ? (
            <div className="p-8 text-center text-text-muted text-[13px]">Cargando guías registradas...</div>
          ) : filteredGuias.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-[13px] space-y-2">
              <Package className="w-8 h-8 text-text-faint mx-auto opacity-50" />
              <p>No se encontraron guías con el filtro seleccionado.</p>
              {filterEstado !== "TODOS" && (
                <button
                  onClick={() => setFilterEstado("TODOS")}
                  className="text-xs text-accent hover:underline cursor-pointer"
                >
                  Ver todas las guías
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium bg-surface-hover/30">
                  <th className="py-2.5 px-3 font-medium">No. guía</th>
                  <th className="py-2.5 px-3 font-medium">Remitente</th>
                  <th className="py-2.5 px-3 font-medium">Destinatario</th>
                  <th className="py-2.5 px-3 text-right font-medium">Peso Real</th>
                  <th className="py-2.5 px-3 text-right font-medium">Facturable</th>
                  <th className="py-2.5 px-3 text-right font-medium">Volumen</th>
                  <th className="py-2.5 px-3 text-right font-medium">Costo</th>
                  <th className="py-2.5 px-3 font-medium">Estado</th>
                  <th className="py-2.5 px-3 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGuias.map((g) => {
                  const volM3 = calcularVolumenM3(g.largoCm, g.anchoCm, g.altoCm);
                  return (
                    <tr
                      key={g.numeroGuia}
                      className="hover:bg-surface-hover/70 transition-colors h-10 group"
                    >
                      <td className="py-2 px-3 font-medium text-text tabular-nums">
                        #{g.numeroGuia}
                      </td>
                      <td className="py-2 px-3 text-text truncate max-w-[150px]">
                        {clientesMap.get(g.idClienteRemitente) || ("Cliente #" + g.idClienteRemitente)}
                      </td>
                      <td className="py-2 px-3 text-text truncate max-w-[150px]">
                        {clientesMap.get(g.idClienteDestinatario) || ("Cliente #" + g.idClienteDestinatario)}
                      </td>
                      <td className="py-2 px-3 text-right text-text-muted tabular-nums">
                        {formatWeight(g.pesoRealKg)}
                      </td>
                      <td className="py-2 px-3 text-right text-text font-medium tabular-nums">
                        {formatWeight(g.pesoFacturableKg)}
                      </td>
                      <td className="py-2 px-3 text-right text-text-muted tabular-nums text-xs">
                        {volM3.toFixed(4)} m³
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-text tabular-nums">
                        {formatCurrency(g.costoTotal)}
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={g.estado} />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={"/rastreo?no=" + g.numeroGuia}
                            title="Rastrear guía"
                            className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setCreatedGuiaModal(g)}
                            title="Ver e imprimir comprobante"
                            className="p-1 rounded text-text-muted hover:text-accent hover:bg-surface-hover transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* COCKPIT DE EMISIÓN EN MODAL DE ALTA PRECISIÓN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cockpit de emisión de guía"
        description="Captura de participantes, medidas físicas y cotización volumétrica en tiempo real."
        maxWidth="720"
      >
        <form onSubmit={handleCrearGuia} className="space-y-4">
          {/* Fila 1: Participantes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Cliente remitente"
              value={idRemitente}
              onChange={(e) => setIdRemitente(Number(e.target.value))}
              required
            >
              <option value="0">-- Seleccione remitente --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (NIT: {c.nit})
                </option>
              ))}
            </Select>

            <Select
              label="Cliente destinatario"
              value={idDestinatario}
              onChange={(e) => setIdDestinatario(Number(e.target.value))}
              required
            >
              <option value="0">-- Seleccione destinatario --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id} disabled={c.id === Number(idRemitente)}>
                  {c.nombre} {c.id === Number(idRemitente) ? "(Mismo cliente)" : ""}
                </option>
              ))}
            </Select>
          </div>

          {/* Fila 2: Ruta y Tarifa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Ruta de distribución"
              value={idRuta}
              onChange={(e) => setIdRuta(Number(e.target.value))}
              required
            >
              <option value="0">-- Seleccione ruta --</option>
              {rutas.map((r) => (
                <option key={r.id} value={r.id}>
                  {(sucursalesMap.get(r.idSucursalOrigen) || ("Origen " + r.idSucursalOrigen)) + " → " +
                  (sucursalesMap.get(r.idSucursalDestino) || ("Destino " + r.idSucursalDestino)) + " (Base: " + formatCurrency(r.tarifaBase) + ")"}
                </option>
              ))}
            </Select>

            <Select
              label="Tipo de carga / tarifa"
              value={idTarifa}
              onChange={(e) => setIdTarifa(Number(e.target.value))}
            >
              <option value="0">Estándar (Tarifa base general)</option>
              {tarifas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tipoCarga + " (+" + formatCurrency(t.precioPorKg) + "/kg)"}
                </option>
              ))}
            </Select>
          </div>

          {/* Sección de Dimensiones y Telemetría Volumétrica */}
          <div className="rounded-panel border border-border bg-bg/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-accent" />
                <span className="text-[13px] font-medium text-text">Medidas físicas y pesaje</span>
              </div>
              <span className="text-[11px] text-text-muted">Fórmula IATA: (L×A×A)/5000</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Input
                label="Largo (cm)"
                type="number"
                step="1"
                min="1"
                placeholder="Ej: 30"
                value={largo}
                onChange={(e) => setLargo(e.target.value)}
                required
              />
              <Input
                label="Ancho (cm)"
                type="number"
                step="1"
                min="1"
                placeholder="Ej: 20"
                value={ancho}
                onChange={(e) => setAncho(e.target.value)}
                required
              />
              <Input
                label="Alto (cm)"
                type="number"
                step="1"
                min="1"
                placeholder="Ej: 15"
                value={alto}
                onChange={(e) => setAlto(e.target.value)}
                required
              />
              <Input
                label="Peso Báscula (kg)"
                type="number"
                step="1"
                min="1"
                placeholder="Ej: 5"
                value={pesoReal}
                onChange={(e) => setPesoReal(e.target.value)}
                required
              />
            </div>

            {/* Tarjeta de Telemetría Dinámica */}
            <div className="rounded border border-border-input/70 bg-surface p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs tabular-nums">
              <div className="space-y-0.5">
                <span className="text-text-muted text-[11px] block">Peso Volumétrico</span>
                <p className="font-semibold text-text text-[13px]">{livePesoVolumetrico.toFixed(2)} kg</p>
                <span className="text-[10px] text-text-faint">{liveVolumenM3.toFixed(4)} m³</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-text-muted text-[11px] block">Peso Facturable</span>
                <p className="font-semibold text-accent text-[13px]">{livePesoFacturable.toFixed(2)} kg</p>
                <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
                  {isVolumetricGreater ? (
                    <span className="text-amber-500 font-semibold">⚡ Por volumen</span>
                  ) : (
                    <span className="text-emerald-500 font-semibold">⚖️ Por báscula</span>
                  )}
                </span>
              </div>

              <div className="space-y-0.5 sm:text-right border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-3">
                <span className="text-text-muted text-[11px] block">Cotización Estimada</span>
                <p className="font-bold text-accent text-[16px] leading-tight">
                  {formatCurrency(liveCostoEstimado)}
                </p>
                <span className="text-[10px] text-text-muted">Flete base + peso + recargos</span>
              </div>
            </div>
          </div>

          {/* Acciones del Modal */}
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
            >
              Emitir y confirmar guía
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Comprobante Oficial Imprimible */}
      {createdGuiaModal && (
        <Modal
          isOpen={true}
          onClose={() => setCreatedGuiaModal(null)}
          title={"Comprobante de envío #" + createdGuiaModal.numeroGuia}
          description="Guía emitida exitosamente. Lista para imprimir comprobante."
          maxWidth="720"
        >
          <div className="space-y-4 text-[13px]">
            <div className="p-4 rounded-panel border border-border bg-surface space-y-3 text-text">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent" />
                  <span className="font-bold text-base tracking-tight">UMG Express</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-text-muted block">Guía Correlativa</span>
                  <span className="font-bold text-lg text-accent tabular-nums">#{createdGuiaModal.numeroGuia}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-2.5 rounded bg-bg/50 border border-border/70 space-y-1">
                  <span className="text-text-muted font-medium block">Remitente</span>
                  <p className="font-semibold text-text">{clientesMap.get(createdGuiaModal.idClienteRemitente) || ("#" + createdGuiaModal.idClienteRemitente)}</p>
                </div>
                <div className="p-2.5 rounded bg-bg/50 border border-border/70 space-y-1">
                  <span className="text-text-muted font-medium block">Destinatario</span>
                  <p className="font-semibold text-text">{clientesMap.get(createdGuiaModal.idClienteDestinatario) || ("#" + createdGuiaModal.idClienteDestinatario)}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border grid grid-cols-3 gap-2 text-xs tabular-nums">
                <div>
                  <span className="text-text-muted block">Peso facturable:</span>
                  <span className="font-semibold">{formatWeight(createdGuiaModal.pesoFacturableKg)}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Dimensiones:</span>
                  <span>{createdGuiaModal.largoCm + "×" + createdGuiaModal.anchoCm + "×" + createdGuiaModal.altoCm + " cm"}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Total cancelado:</span>
                  <span className="font-bold text-accent text-[14px]">{formatCurrency(createdGuiaModal.costoTotal)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreatedGuiaModal(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
              >
                Imprimir comprobante
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
