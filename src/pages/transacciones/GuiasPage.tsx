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
import {
  formatCurrency,
  formatWeight,
} from "@/lib/utils";
import {
  calcularPesoVolumetrico,
  calcularVolumenM3,
  calcularPesoFacturable,
  calcularCostoEstimado,
} from "@/lib/calculos";
import { Search, Printer } from "lucide-react";
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
  const [pesoReal, setPesoReal] = useState<number>(1);
  const [largo, setLargo] = useState<number>(20);
  const [ancho, setAncho] = useState<number>(15);
  const [alto, setAlto] = useState<number>(10);

  // Load catalogs
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

  const sucursalesMap = useMemo(() => {
    return new Map(sucursales.map((s) => [s.id, s.nombre]));
  }, [sucursales]);

  const clientesMap = useMemo(() => {
    return new Map(clientes.map((c) => [c.id, c.nombre]));
  }, [clientes]);

  const selectedRuta = rutas.find((r) => r.id === Number(idRuta));
  const selectedTarifa = tarifas.find((t) => t.id === Number(idTarifa));

  const livePesoVolumetrico = calcularPesoVolumetrico(largo, ancho, alto);
  const liveVolumenM3 = calcularVolumenM3(largo, ancho, alto);
  const livePesoFacturable = calcularPesoFacturable(pesoReal, livePesoVolumetrico);
  const liveCostoEstimado = calcularCostoEstimado(
    selectedRuta?.tarifaBase || 0,
    livePesoFacturable,
    liveVolumenM3,
    selectedTarifa
  );

  const createMutation = useMutation({
    mutationFn: (payload: CrearGuiaPayload) => guiasApi.crear(payload),
    onSuccess: (guiaCreada) => {
      queryClient.invalidateQueries({ queryKey: ["guias"] });
      queryClient.invalidateQueries({ queryKey: ["liquidacion"] });
      toast.success(`Guía #${guiaCreada.numeroGuia} emitida`);
      setIsModalOpen(false);
      setCreatedGuiaModal(guiaCreada);
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al emitir guía");
    },
  });

  const handleCrearGuia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idRemitente || !idDestinatario || !idRuta) {
      toast.error("Complete los campos obligatorios");
      return;
    }
    if (idRemitente === idDestinatario) {
      toast.error("El remitente no puede ser igual al destinatario");
      return;
    }
    if (pesoReal <= 0 || largo <= 0 || ancho <= 0 || alto <= 0) {
      toast.error("Las dimensiones y peso deben ser mayores a cero");
      return;
    }

    createMutation.mutate({
      idClienteRemitente: Number(idRemitente),
      idClienteDestinatario: Number(idDestinatario),
      idRuta: Number(idRuta),
      pesoRealKg: Number(pesoReal),
      largoCm: Number(largo),
      anchoCm: Number(ancho),
      altoCm: Number(alto),
      idTarifa: idTarifa ? Number(idTarifa) : undefined,
    });
  };

  const filteredGuias = useMemo(() => {
    return guias.filter((g) => {
      const matchSearch =
        searchTerm === "" ||
        g.numeroGuia.toString().includes(searchTerm) ||
        (clientesMap.get(g.idClienteRemitente) || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clientesMap.get(g.idClienteDestinatario) || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado = filterEstado === "TODOS" || g.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [guias, searchTerm, filterEstado, clientesMap]);

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text">Emisión de guías</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (clientes.length < 2) {
              toast.error("Debe registrar al menos 2 clientes para emitir guías");
              return;
            }
            if (rutas.length === 0) {
              toast.error("Debe registrar al menos una ruta de distribución");
              return;
            }
            setIsModalOpen(true);
          }}
        >
          Nueva guía
        </Button>
      </div>

      {/* Barra de herramientas */}
      <div className="rounded-panel border border-border bg-surface p-3 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número o cliente"
            className="w-full h-8 bg-surface text-text text-[13px] rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full sm:w-40 h-8 bg-surface text-text text-[13px] rounded-control border border-border-input px-2.5 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="Creada">En bodega</option>
            <option value="Despachada">En tránsito</option>
            <option value="Entregada">Entregada</option>
          </select>
        </div>
      </div>

      {/* Listado denso */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {loadingGuias ? (
            <div className="p-6 text-center text-text-muted text-[13px]">Cargando guías...</div>
          ) : filteredGuias.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-text-muted">
              No hay guías registradas que coincidan con la búsqueda.
            </div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">No. guía</th>
                  <th className="py-2 px-3 font-medium">Remitente</th>
                  <th className="py-2 px-3 font-medium">Destinatario</th>
                  <th className="py-2 px-3 font-medium">Ruta</th>
                  <th className="py-2 px-3 font-medium">Medidas (cm)</th>
                  <th className="py-2 px-3 text-right font-medium">Peso (kg)</th>
                  <th className="py-2 px-3 text-right font-medium">Costo</th>
                  <th className="py-2 px-3 font-medium">Estado</th>
                  <th className="py-2 px-3 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGuias.map((g) => {
                  const rutaObj = rutas.find((r) => r.id === g.idRuta);
                  const origName = rutaObj ? sucursalesMap.get(rutaObj.idSucursalOrigen) : `Suc ${g.idRuta}`;
                  const destName = rutaObj ? sucursalesMap.get(rutaObj.idSucursalDestino) : `Dest`;

                  return (
                    <tr key={g.numeroGuia} className="hover:bg-surface-hover transition-colors h-10">
                      <td className="py-2 px-3">
                        <Link to={`/rastreo?no=${g.numeroGuia}`} className="text-text hover:underline tabular-nums">
                          {g.numeroGuia}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-text truncate max-w-[130px]">
                        {clientesMap.get(g.idClienteRemitente) || `Cliente #${g.idClienteRemitente}`}
                      </td>
                      <td className="py-2 px-3 text-text truncate max-w-[130px]">
                        {clientesMap.get(g.idClienteDestinatario) || `Cliente #${g.idClienteDestinatario}`}
                      </td>
                      <td className="py-2 px-3 text-text-muted text-[12px]">
                        {origName} → {destName}
                      </td>
                      <td className="py-2 px-3 text-text-muted tabular-nums">
                        {g.largoCm}×{g.anchoCm}×{g.altoCm}
                      </td>
                      <td className="py-2 px-3 text-right text-text tabular-nums">
                        {formatWeight(g.pesoFacturableKg)}
                      </td>
                      <td className="py-2 px-3 text-right text-text tabular-nums font-medium">
                        {formatCurrency(g.costoTotal)}
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={g.estado} />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/rastreo?no=${g.numeroGuia}`}
                            className="text-accent hover:underline text-[13px]"
                          >
                            Rastrear
                          </Link>
                          <button
                            onClick={() => setCreatedGuiaModal(g)}
                            title="Imprimir comprobante"
                            className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
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

      {/* Formulario de emisión en modal acotado a 720px */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva guía de envío"
        description="Capture remitente, destinatario y medidas físicas del envío."
        maxWidth="720"
      >
        <form onSubmit={handleCrearGuia} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Ruta de distribución"
              value={idRuta}
              onChange={(e) => setIdRuta(Number(e.target.value))}
              required
            >
              <option value="0">-- Seleccione ruta --</option>
              {rutas.map((r) => (
                <option key={r.id} value={r.id}>
                  {sucursalesMap.get(r.idSucursalOrigen) || `Origen ${r.idSucursalOrigen}`} →{" "}
                  {sucursalesMap.get(r.idSucursalDestino) || `Destino ${r.idSucursalDestino}`} (Base: {formatCurrency(r.tarifaBase)})
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
                  {t.tipoCarga} (+{formatCurrency(t.precioPorKg)}/kg)
                </option>
              ))}
            </Select>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <span className="text-[13px] font-medium text-text block">Dimensiones del paquete</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Input
                label="Largo (cm)"
                type="number"
                step="0.1"
                min="0.1"
                value={largo}
                onChange={(e) => setLargo(parseFloat(e.target.value) || 0)}
                required
              />
              <Input
                label="Ancho (cm)"
                type="number"
                step="0.1"
                min="0.1"
                value={ancho}
                onChange={(e) => setAncho(parseFloat(e.target.value) || 0)}
                required
              />
              <Input
                label="Alto (cm)"
                type="number"
                step="0.1"
                min="0.1"
                value={alto}
                onChange={(e) => setAlto(parseFloat(e.target.value) || 0)}
                required
              />
              <Input
                label="Peso real (kg)"
                type="number"
                step="0.01"
                min="0.01"
                value={pesoReal}
                onChange={(e) => setPesoReal(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[12px] text-text-muted tabular-nums">
              <div>
                Volumen: <span className="text-text">{liveVolumenM3.toFixed(4)} m³</span> · Volumétrico: <span className="text-text">{livePesoVolumetrico.toFixed(2)} kg</span>
              </div>
              <div>
                Peso facturable: <span className="text-text font-medium">{livePesoFacturable.toFixed(2)} kg</span>
              </div>
              <div>
                Costo estimado: <span className="text-accent font-semibold">{formatCurrency(liveCostoEstimado)}</span>
              </div>
            </div>
          </div>

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
              Guardar guía
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Comprobante */}
      {createdGuiaModal && (
        <Modal
          isOpen={true}
          onClose={() => setCreatedGuiaModal(null)}
          title={`Comprobante de guía #${createdGuiaModal.numeroGuia}`}
          description="Comprobante generado listo para impresión."
          maxWidth="720"
        >
          <div className="space-y-3 text-[13px]">
            <div className="p-3 rounded-panel border border-border bg-surface space-y-2 text-text">
              <div className="flex justify-between border-b border-border pb-1.5 font-medium">
                <span>UMG Express</span>
                <span>Guía #{createdGuiaModal.numeroGuia}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div>
                  <span className="text-text-muted block">Remitente:</span>
                  <span>{clientesMap.get(createdGuiaModal.idClienteRemitente) || `#${createdGuiaModal.idClienteRemitente}`}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Destinatario:</span>
                  <span>{clientesMap.get(createdGuiaModal.idClienteDestinatario) || `#${createdGuiaModal.idClienteDestinatario}`}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border grid grid-cols-3 gap-2 text-[12px] tabular-nums">
                <div>
                  <span className="text-text-muted block">Peso facturable:</span>
                  <span>{formatWeight(createdGuiaModal.pesoFacturableKg)}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Medidas:</span>
                  <span>{createdGuiaModal.largoCm}×{createdGuiaModal.anchoCm}×{createdGuiaModal.altoCm} cm</span>
                </div>
                <div>
                  <span className="text-text-muted block">Total flete:</span>
                  <span className="font-semibold text-text">{formatCurrency(createdGuiaModal.costoTotal)}</span>
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