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
import {
  Plus,
  Search,
  Printer,
} from "lucide-react";
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
      toast.success(`Guía #${guiaCreada.numeroGuia} emitida exitosamente`);
      setIsModalOpen(false);
      setCreatedGuiaModal(guiaCreada);
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al emitir la guía");
    },
  });

  const handleCrearGuia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idRemitente || !idDestinatario || !idRuta) {
      toast.error("Por favor complete los campos obligatorios");
      return;
    }
    if (idRemitente === idDestinatario) {
      toast.error("El cliente remitente no puede ser igual al destinatario");
      return;
    }
    if (pesoReal <= 0 || largo <= 0 || ancho <= 0 || alto <= 0) {
      toast.error("Las dimensiones y el peso deben ser mayores a cero");
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
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Emisión de Guías</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro, cubicaje y emisión de guías de envío
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (clientes.length < 2) {
              toast.error("Debe tener al menos 2 clientes registrados para emitir guías");
            }
            if (rutas.length === 0) {
              toast.error("Debe registrar al menos una ruta de distribución");
            }
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Nueva guía
        </Button>
      </div>

      {/* Barra de herramientas */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-3 flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número o cliente..."
            className="w-full bg-slate-900 text-slate-100 text-xs rounded-lg border border-slate-750 pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full sm:w-44 bg-slate-900 text-slate-200 text-xs rounded-lg border border-slate-750 px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="Creada">En bodega</option>
            <option value="Despachada">En tránsito</option>
            <option value="Entregada">Entregada</option>
          </select>
        </div>
      </div>

      {/* Listado denso */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
        <div className="overflow-x-auto">
          {loadingGuias ? (
            <div className="p-8 text-center text-slate-500 text-xs">Cargando guías...</div>
          ) : filteredGuias.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay guías registradas que coincidan con la búsqueda.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2.5 px-3">No. guía</th>
                  <th className="py-2.5 px-3">Remitente</th>
                  <th className="py-2.5 px-3">Destinatario</th>
                  <th className="py-2.5 px-3">Ruta</th>
                  <th className="py-2.5 px-3">Medidas</th>
                  <th className="py-2.5 px-3">Peso fact.</th>
                  <th className="py-2.5 px-3">Costo</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGuias.map((g) => {
                  const rutaObj = rutas.find((r) => r.id === g.idRuta);
                  const origName = rutaObj ? sucursalesMap.get(rutaObj.idSucursalOrigen) : `Suc ${g.idRuta}`;
                  const destName = rutaObj ? sucursalesMap.get(rutaObj.idSucursalDestino) : `Dest`;

                  return (
                    <tr key={g.numeroGuia} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2 px-3 font-mono font-medium text-slate-200">
                        {g.numeroGuia}
                      </td>
                      <td className="py-2 px-3 text-slate-200 truncate max-w-[140px]">
                        {clientesMap.get(g.idClienteRemitente) || `Cliente #${g.idClienteRemitente}`}
                      </td>
                      <td className="py-2 px-3 text-slate-200 truncate max-w-[140px]">
                        {clientesMap.get(g.idClienteDestinatario) || `Cliente #${g.idClienteDestinatario}`}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">
                        {origName} → {destName}
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                        {g.largoCm}×{g.anchoCm}×{g.altoCm}
                      </td>
                      <td className="py-2 px-3 text-slate-300 tabular-nums">
                        {formatWeight(g.pesoFacturableKg)}
                      </td>
                      <td className="py-2 px-3 text-slate-300 tabular-nums font-medium">
                        {formatCurrency(g.costoTotal)}
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={g.estado} />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/rastreo?no=${g.numeroGuia}`}
                            className="text-xs text-amber-500 hover:text-amber-400 transition-colors font-medium"
                          >
                            Rastrear
                          </Link>
                          <button
                            onClick={() => setCreatedGuiaModal(g)}
                            title="Imprimir comprobante"
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
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

      {/* Formulario de emisión (Modal hasta 720px) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Emisión de Guía de Envío"
        description="Capture remitente, destinatario y medidas físicas del envío."
        maxWidth="720"
      >
        <form onSubmit={handleCrearGuia} className="space-y-4">
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

          {/* Dimensiones y cubicaje */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-3">
            <span className="text-xs font-medium text-slate-300 block">Medidas físicas del paquete</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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

            {/* Resumen de cálculo en tiempo real */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 tabular-nums">
              <div>
                Volumen: <span className="text-slate-200">{liveVolumenM3.toFixed(4)} m³</span> · Volumétrico: <span className="text-slate-200">{livePesoVolumetrico.toFixed(2)} kg</span>
              </div>
              <div>
                Peso facturable: <span className="font-medium text-slate-200">{livePesoFacturable.toFixed(2)} kg</span>
              </div>
              <div>
                Costo estimado: <span className="font-semibold text-amber-500">{formatCurrency(liveCostoEstimado)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              Emitir guía
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Comprobante / Etiqueta generada */}
      {createdGuiaModal && (
        <Modal
          isOpen={true}
          onClose={() => setCreatedGuiaModal(null)}
          title={`Comprobante de Guía #${createdGuiaModal.numeroGuia}`}
          description="Comprobante generado listo para impresión."
          maxWidth="720"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/80 space-y-2 text-slate-200">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-500">UMG Express</span>
                <span>Guía #{createdGuiaModal.numeroGuia}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Remitente:</span>
                  <span>{clientesMap.get(createdGuiaModal.idClienteRemitente) || `#${createdGuiaModal.idClienteRemitente}`}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Destinatario:</span>
                  <span>{clientesMap.get(createdGuiaModal.idClienteDestinatario) || `#${createdGuiaModal.idClienteDestinatario}`}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-[11px] tabular-nums">
                <div>
                  <span className="text-slate-400 block">Peso facturable:</span>
                  <span>{formatWeight(createdGuiaModal.pesoFacturableKg)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Dimensiones:</span>
                  <span>{createdGuiaModal.largoCm}×{createdGuiaModal.anchoCm}×{createdGuiaModal.altoCm} cm</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total flete:</span>
                  <span className="font-bold text-slate-100">{formatCurrency(createdGuiaModal.costoTotal)}</span>
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
                leftIcon={<Printer className="w-3.5 h-3.5" />}
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
