import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guiasApi, CrearGuiaPayload } from "@/api/guias";
import { clientesApi, rutasApi, sucursalesApi, tarifasApi } from "@/api/catalogos";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  formatCurrency,
  formatWeight,
  formatVolume,
  formatNumber,
} from "@/lib/utils";
import {
  calcularPesoVolumetrico,
  calcularVolumenM3,
  calcularPesoFacturable,
  calcularCostoEstimado,
} from "@/lib/calculos";
import {
  Package,
  PlusCircle,
  Search,
  Printer,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
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

  // Map for branch names
  const sucursalesMap = useMemo(() => {
    return new Map(sucursales.map((s) => [s.id, s.nombre]));
  }, [sucursales]);

  const clientesMap = useMemo(() => {
    return new Map(clientes.map((c) => [c.id, c.nombre]));
  }, [clientes]);

  // Selected route and tariff objects for live calculation
  const selectedRuta = rutas.find((r) => r.id === Number(idRuta));
  const selectedTarifa = tarifas.find((t) => t.id === Number(idTarifa));

  // Live calculations
  const livePesoVolumetrico = calcularPesoVolumetrico(largo, ancho, alto);
  const liveVolumenM3 = calcularVolumenM3(largo, ancho, alto);
  const livePesoFacturable = calcularPesoFacturable(pesoReal, livePesoVolumetrico);
  const liveCostoEstimado = calcularCostoEstimado(
    selectedRuta?.tarifaBase || 0,
    livePesoFacturable,
    liveVolumenM3,
    selectedTarifa
  );

  // Mutation
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

  // Filtered guides
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Gestión de Guías de Envío
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Recepción de paquetería, cubicaje volumétrico y emisión de guías numeradas.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            if (clientes.length < 2) {
              toast.error("Debe tener al menos 2 clientes registrados para emitir guías");
            }
            if (rutas.length === 0) {
              toast.error("Debe registrar al menos una ruta de distribución");
            }
            setIsModalOpen(true);
          }}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Emitir Nueva Guía
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número de guía o cliente..."
              className="w-full bg-slate-950/80 text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-800 pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full sm:w-48 bg-slate-950/80 text-slate-200 text-xs sm:text-sm rounded-xl border border-slate-800 px-3 py-2.5 focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="Creada">En Bodega</option>
              <option value="Despachada">En Ruta</option>
              <option value="Entregada">Entregada</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Guides Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {loadingGuias ? (
            <div className="p-12 text-center text-slate-500">Cargando catálogo de guías...</div>
          ) : filteredGuias.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No se encontraron guías</p>
              <p className="text-xs text-slate-500">
                {searchTerm ? "Pruebe con otro término de búsqueda" : "Haga clic en 'Emitir Nueva Guía' para comenzar"}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">No. Guía</th>
                  <th className="py-3 px-4">Remitente</th>
                  <th className="py-3 px-4">Destinatario</th>
                  <th className="py-3 px-4">Ruta</th>
                  <th className="py-3 px-4">Medidas (cm)</th>
                  <th className="py-3 px-4">Peso Fact.</th>
                  <th className="py-3 px-4">Costo Total</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredGuias.map((g) => {
                  const rutaObj = rutas.find((r) => r.id === g.idRuta);
                  const origName = rutaObj ? sucursalesMap.get(rutaObj.idSucursalOrigen) : `Suc ${g.idRuta}`;
                  const destName = rutaObj ? sucursalesMap.get(rutaObj.idSucursalDestino) : `Dest`;

                  return (
                    <tr key={g.numeroGuia} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        #{g.numeroGuia}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {clientesMap.get(g.idClienteRemitente) || `Cliente #${g.idClienteRemitente}`}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {clientesMap.get(g.idClienteDestinatario) || `Cliente #${g.idClienteDestinatario}`}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {origName} → {destName}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {g.largoCm}×{g.anchoCm}×{g.altoCm}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {formatWeight(g.pesoFacturableKg)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {formatCurrency(g.costoTotal)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={g.estado} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setCreatedGuiaModal(g)}
                          title="Ver e Imprimir Etiqueta"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Emission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Emisión de Guía de Envío"
        description="Capture las dimensiones del paquete y los datos de clientes para calcular el flete automáticamente."
        maxWidth="2xl"
      >
        <form onSubmit={handleCrearGuia} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Cliente Remitente"
              value={idRemitente}
              onChange={(e) => setIdRemitente(Number(e.target.value))}
              required
            >
              <option value="0">-- Seleccione Remitente --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (NIT: {c.nit})
                </option>
              ))}
            </Select>

            <Select
              label="Cliente Destinatario"
              value={idDestinatario}
              onChange={(e) => setIdDestinatario(Number(e.target.value))}
              required
            >
              <option value="0">-- Seleccione Destinatario --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id} disabled={c.id === Number(idRemitente)}>
                  {c.nombre} {c.id === Number(idRemitente) ? "(Mismo cliente)" : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Ruta de Distribución"
              value={idRuta}
              onChange={(e) => setIdRuta(Number(e.target.value))}
              required
            >
              <option value="0">-- Seleccione Ruta --</option>
              {rutas.map((r) => (
                <option key={r.id} value={r.id}>
                  {sucursalesMap.get(r.idSucursalOrigen) || `Origen ${r.idSucursalOrigen}`} →{" "}
                  {sucursalesMap.get(r.idSucursalDestino) || `Destino ${r.idSucursalDestino}`} (Base: {formatCurrency(r.tarifaBase)})
                </option>
              ))}
            </Select>

            <Select
              label="Tipo de Carga / Tarifa (Opcional)"
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

          {/* Measurements */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Dimensiones y Cubicaje Físico</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                label="Peso Real (kg)"
                type="number"
                step="0.1"
                min="0.1"
                value={pesoReal}
                onChange={(e) => setPesoReal(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Real-time Mathematical Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider font-mono">
                Cálculo Matemático en Vivo
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Fórmula: (L×W×H)/5000
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Peso Volumétrico</span>
                <span className="text-sm font-bold text-slate-100">{formatWeight(livePesoVolumetrico)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Volumen (m³)</span>
                <span className="text-sm font-bold text-slate-100">{formatVolume(liveVolumenM3)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/40">
                <span className="text-[10px] text-amber-400 block font-bold">Peso Facturable</span>
                <span className="text-sm font-extrabold text-amber-400">{formatWeight(livePesoFacturable)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/40">
                <span className="text-[10px] text-emerald-400 block font-bold">Costo Estimado</span>
                <span className="text-sm font-extrabold text-emerald-400">{formatCurrency(liveCostoEstimado)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              * El peso facturable aplica el mayor entre el peso real ({formatWeight(pesoReal)}) y el peso volumétrico ({formatWeight(livePesoVolumetrico)}).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Emitir y Guardar Guía
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Waybill Label Modal */}
      {createdGuiaModal && (
        <Modal
          isOpen={true}
          onClose={() => setCreatedGuiaModal(null)}
          title={`Etiqueta de Envío — Guía #${createdGuiaModal.numeroGuia}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-xl font-mono text-xs border border-slate-300 space-y-4 print-only">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div>
                  <h3 className="text-xl font-black tracking-tight">UMG EXPRESS</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-600">Comprobante Oficial de Flete</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black">#{createdGuiaModal.numeroGuia}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded">EN BODEGA</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-[10px] text-slate-500 block">REMITENTE</span>
                  <div className="font-bold text-sm">
                    {clientesMap.get(createdGuiaModal.idClienteRemitente) || `ID #${createdGuiaModal.idClienteRemitente}`}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-[10px] text-slate-500 block">DESTINATARIO</span>
                  <div className="font-bold text-sm">
                    {clientesMap.get(createdGuiaModal.idClienteDestinatario) || `ID #${createdGuiaModal.idClienteDestinatario}`}
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">PESO REAL</span>
                  <span className="font-bold text-sm">{formatWeight(createdGuiaModal.pesoRealKg)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">VOLUMÉTRICO</span>
                  <span className="font-bold text-sm">{formatWeight(createdGuiaModal.pesoVolumetricoKg)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">FACTURABLE</span>
                  <span className="font-black text-sm text-slate-950">{formatWeight(createdGuiaModal.pesoFacturableKg)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">DIMENSIONES</span>
                  <span className="font-bold">{createdGuiaModal.largoCm} × {createdGuiaModal.anchoCm} × {createdGuiaModal.altoCm} cm</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">IMPORTE TOTAL</span>
                  <span className="text-xl font-black text-slate-950">{formatCurrency(createdGuiaModal.costoTotal)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 no-print">
              <Button
                variant="outline"
                onClick={() => setCreatedGuiaModal(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Imprimir Etiqueta
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
