import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { reportesApi } from "@/api/reportes";
import { guiasApi } from "@/api/guias";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import type { RastreoInfo, EstadoGuia } from "@/types";
import { Search, Printer, Copy, Check, Package, MapPin, Truck, Calendar, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function RastreoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGuia = searchParams.get("no") || "";

  const [guiaNumber, setGuiaNumber] = useState(initialGuia);
  const [data, setData] = useState<RastreoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmEntregar, setConfirmEntregar] = useState(false);
  const [modalCambiarEstado, setModalCambiarEstado] = useState(false);
  const [nuevoEstadoRastreo, setNuevoEstadoRastreo] = useState<EstadoGuia>("Entregada");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleMarcarEntregada = async () => {
    if (!data) return;
    setIsActionLoading(true);
    try {
      await guiasApi.marcarEntregada(data.numeroGuia);
      toast.success(`Guía #${data.numeroGuia} marcada como Entregada exitosamente`);
      setConfirmEntregar(false);
      await buscarGuia(data.numeroGuia);
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || err.message || "Error al entregar guía");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleActualizarEstado = async () => {
    if (!data) return;
    setIsActionLoading(true);
    try {
      await guiasApi.actualizarEstado(data.numeroGuia, nuevoEstadoRastreo);
      toast.success(`Estado de guía actualizado a '${nuevoEstadoRastreo}'`);
      setModalCambiarEstado(false);
      await buscarGuia(data.numeroGuia);
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || err.message || "Error al actualizar estado");
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    if (initialGuia) {
      buscarGuia(Number(initialGuia));
    }
  }, [initialGuia]);

  const buscarGuia = async (no: number) => {
    if (!no || isNaN(no)) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await reportesApi.obtenerRastreo(no);
      setData(res);
    } catch (err: any) {
      setData(null);
      toast.error(err.message || "No se encontró la guía solicitada");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const no = Number(guiaNumber);
    if (!no) {
      toast.error("Ingrese un número de guía válido");
      return;
    }
    setSearchParams({ no: no.toString() });
    buscarGuia(no);
  };

  const handleCopyGuia = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.numeroGuia.toString());
    setCopied(true);
    toast.success("Número de guía copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Cabecera Web (Oculta en Impresión) */}
      <div className="flex items-center justify-between no-print">
        <h1 className="text-[20px] font-semibold text-text">Rastreo de guía</h1>
        {data && (
          <div className="flex flex-wrap items-center gap-2">
            {data.estado !== "Entregada" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmEntregar(true)}
                className="gap-1.5 text-success hover:text-success hover:border-success/50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar como entregada</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNuevoEstadoRastreo(data.estado as EstadoGuia);
                setModalCambiarEstado(true);
              }}
              className="gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cambiar estado</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 active:scale-[0.97]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir comprobante oficial</span>
            </Button>
          </div>
        )}
      </div>

      {/* Buscador Web (Oculto en Impresión) */}
      <div className="rounded-panel border border-border bg-surface p-3 no-print">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="number"
              step="1"
              value={guiaNumber}
              onChange={(e) => setGuiaNumber(e.target.value)}
              placeholder="Número de guía (ej. 1001)"
              className="w-full h-8 bg-surface text-text text-[13px] rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 tabular-nums transition-colors"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
            className="active:scale-[0.97]"
          >
            Buscar
          </Button>
        </form>
      </div>

      {/* Vista en Pantalla y Documento Oficial Imprimible */}
      {data ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* ============================================================== */}
          {/* ENCABEZADO OFICIAL DE DOCUMENTO (VISIBLE AL IMPRIMIR)           */}
          {/* ============================================================== */}
          <div className="print-only border-b-2 border-black pb-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-black text-white font-black text-base flex items-center justify-center rounded">
                    U
                  </div>
                  <div>
                    <h2 className="text-[16pt] font-black tracking-tight text-black leading-none">
                      UMG EXPRESS
                    </h2>
                    <p className="text-[9pt] text-gray-700 tracking-wider uppercase font-semibold">
                      Control Logístico · Transporte y Carga Pesada
                    </p>
                  </div>
                </div>
                <p className="text-[8.5pt] text-gray-600 mt-1">
                  República de Guatemala, Centroamérica · PBX: (502) 2444-5555
                </p>
              </div>

              <div className="text-right">
                <div className="inline-block border border-black px-3 py-1 font-mono font-bold text-[13pt] text-black bg-gray-50">
                  GUÍA #{data.numeroGuia}
                </div>
                <p className="text-[8.5pt] text-gray-600 mt-1">
                  Emisión: {new Date().toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                {/* Código de barras simulado formal */}
                <div className="text-[12pt] font-mono tracking-[4px] text-black select-none mt-0.5">
                  ||| | ||||| || |||||| | |||
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-300 flex items-center justify-between text-[9.5pt]">
              <div>
                <span className="font-bold">DOCUMENTO:</span> Comprobante Oficial de Porte y Guía de Envío
              </div>
              <div>
                <span className="font-bold">ESTADO OPERATIVO:</span> {data.estado.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Historial de estados en pantalla (Web view) */}
          <div className="rounded-panel border border-border bg-surface p-4 no-print">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-text-muted">Guía</span>
                <span className="text-[16px] font-semibold text-text tabular-nums">
                  #{data.numeroGuia}
                </span>
                <button
                  onClick={handleCopyGuia}
                  title="Copiar número de guía"
                  className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <StatusBadge status={data.estado} />
              </div>
              <div className="text-[13px] text-text tabular-nums">
                Costo: <span className="font-semibold">{formatCurrency(data.paquete.costoTotal)}</span>
              </div>
            </div>

            <div className="pt-3">
              <div className="text-[12px] text-text-muted mb-2">Estados del envío</div>
              <div className="space-y-2.5 border-l border-border ml-2 pl-3 text-[13px]">
                <div className="relative">
                  <div className="absolute -left-[17px] top-1.5 w-1.5 h-1.5 rounded-full bg-ok" />
                  <p className="font-medium text-text">En bodega</p>
                  <p className="text-[12px] text-text-muted">
                    Medidas: {data.paquete.largoCm}×{data.paquete.anchoCm}×{data.paquete.altoCm} cm, {formatWeight(data.paquete.pesoFacturableKg)}
                  </p>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-[17px] top-1.5 w-1.5 h-1.5 rounded-full ${
                      data.despacho?.despachada || data.estado === "Despachada" || data.estado === "Entregada"
                        ? "bg-info"
                        : "bg-text-faint"
                    }`}
                  />
                  <p className="font-medium text-text">En tránsito</p>
                  <p className="text-[12px] text-text-muted">
                    {data.despacho?.despachada
                      ? `Vehículo ${data.despacho.vehiculo?.placa || ""} (${data.despacho.vehiculo?.marcaModelo || ""})${data.despacho.piloto ? ` · Piloto: ${data.despacho.piloto.nombre}` : ""} · ${data.despacho.fechaDespacho || ""}`
                      : "Pendiente de asignación"}
                  </p>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-[17px] top-1.5 w-1.5 h-1.5 rounded-full ${
                      data.estado === "Entregada" ? "bg-ok" : "bg-text-faint"
                    }`}
                  />
                  <p className="font-medium text-text">Entregada</p>
                  <p className="text-[12px] text-text-muted">
                    {data.estado === "Entregada" ? "Paquete entregado en destino" : "Pendiente de entrega"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BLOQUE FORMAL: REMITENTE Y DESTINATARIO                        */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px] print:grid-cols-2 print:gap-4 print:text-[10pt]">
            {/* Remitente */}
            <div className="rounded-panel border border-border bg-surface p-4 space-y-2 print:border print:border-black print:p-3 print:bg-white print:rounded-none">
              <div className="flex items-center justify-between pb-1 border-b border-border print:border-black">
                <h3 className="text-[13px] font-bold text-text uppercase tracking-wider print:text-black">
                  1. Datos del Remitente (Origen)
                </h3>
                <span className="text-[11px] text-text-muted print:text-black font-mono">
                  ID: #{data.remitente?.id || "N/A"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-text text-[14px] print:text-black">
                  {data.remitente?.nombre || "No especificado"}
                </p>
                <p className="text-text-muted print:text-black">
                  <strong>NIT:</strong> {data.remitente?.nit || "C/F"} · <strong>Tel:</strong> {data.remitente?.telefono || "N/A"}
                </p>
                <p className="text-text-muted print:text-black">
                  <strong>Dirección:</strong> {data.remitente?.direccion || "Ciudad"}
                </p>
              </div>
            </div>

            {/* Destinatario */}
            <div className="rounded-panel border border-border bg-surface p-4 space-y-2 print:border print:border-black print:p-3 print:bg-white print:rounded-none">
              <div className="flex items-center justify-between pb-1 border-b border-border print:border-black">
                <h3 className="text-[13px] font-bold text-text uppercase tracking-wider print:text-black">
                  2. Datos del Destinatario (Destino)
                </h3>
                <span className="text-[11px] text-text-muted print:text-black font-mono">
                  ID: #{data.destinatario?.id || "N/A"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-text text-[14px] print:text-black">
                  {data.destinatario?.nombre || "No especificado"}
                </p>
                <p className="text-text-muted print:text-black">
                  <strong>NIT:</strong> {data.destinatario?.nit || "C/F"} · <strong>Tel:</strong> {data.destinatario?.telefono || "N/A"}
                </p>
                <p className="text-text-muted print:text-black">
                  <strong>Dirección:</strong> {data.destinatario?.direccion || "Ciudad"}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TABLA TÉCNICA DE CARGA Y TARIFA (DISEÑO FORMAL PARA IMPRESIÓN)  */}
          {/* ============================================================== */}
          <div className="rounded-panel border border-border bg-surface p-4 space-y-3 print:border print:border-black print:p-3 print:bg-white print:rounded-none">
            <h3 className="text-[13px] font-bold text-text uppercase tracking-wider pb-1 border-b border-border print:border-black print:text-black">
              3. Ficha Técnica de Carga y Liquidación de Flete
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse print:text-[9.5pt]">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/50 text-text-muted text-[11px] font-bold uppercase tracking-wider print:border-black print:bg-gray-100 print:text-black">
                    <th className="py-2 px-3">Dimensiones Físicas</th>
                    <th className="py-2 px-3 text-right">Peso Báscula</th>
                    <th className="py-2 px-3 text-right">Peso Volumétrico</th>
                    <th className="py-2 px-3 text-right">Peso Facturable</th>
                    <th className="py-2 px-3 text-right">Tarifa Base</th>
                    <th className="py-2 px-3 text-right">Flete Total Cobrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-black">
                  <tr className="print:border-b print:border-black">
                    <td className="py-2 px-3 font-mono print:text-black">
                      {data.paquete.largoCm} × {data.paquete.anchoCm} × {data.paquete.altoCm} cm
                    </td>
                    <td className="py-2 px-3 text-right font-mono print:text-black">
                      {formatWeight(data.paquete.pesoRealKg)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono print:text-black">
                      {formatWeight(data.paquete.pesoVolumetricoKg)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold print:text-black">
                      {formatWeight(data.paquete.pesoFacturableKg)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono print:text-black">
                      {formatCurrency(data.ruta?.tarifaBase || 0)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-accent text-[13px] print:text-black">
                      {formatCurrency(data.paquete.costoTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Trayecto y Despacho */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[12px] print:text-[9.5pt]">
              <div className="p-2.5 rounded bg-surface-hover/30 border border-border/60 print:border print:border-black print:bg-transparent">
                <span className="font-bold block text-text print:text-black mb-0.5">Ruta de Transporte:</span>
                <p className="text-text-muted print:text-black">
                  {data.ruta?.origen?.nombre || "Origen"} → {data.ruta?.destino?.nombre || "Destino"} ({data.ruta?.distanciaKm || 0} km)
                </p>
              </div>

              <div className="p-2.5 rounded bg-surface-hover/30 border border-border/60 print:border print:border-black print:bg-transparent">
                <span className="font-bold block text-text print:text-black mb-0.5">Asignación Vehicular:</span>
                <p className="text-text-muted print:text-black font-mono">
                  {data.despacho?.despachada
                    ? `${data.despacho.vehiculo?.placa || "N/A"} (${data.despacho.vehiculo?.marcaModelo || ""}) · Piloto: ${data.despacho.piloto?.nombre || "No asignado"}`
                    : "En patio / Pendiente de estiba"}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* CADENA DE CUSTODIA Y FIRMAS LEGALES (IMPRESIÓN OFICIAL)         */}
          {/* ============================================================== */}
          <div className="print-only avoid-break pt-6 border-t border-black">
            <p className="text-[8.5pt] text-gray-700 text-center mb-8">
              El presente comprobante ampara el transporte y custodia de la paquetería descrita, conforme
              a la legislación de transporte terrestre de la República de Guatemala. En caso de reclamo, presente este documento.
            </p>

            <div className="grid grid-cols-3 gap-6 text-center text-[9pt]">
              <div className="space-y-1">
                <div className="border-b border-black h-14" />
                <p className="font-bold text-black pt-1">Firma del Remitente</p>
                <p className="text-[8pt] text-gray-600">Declaro el contenido y peso</p>
              </div>

              <div className="space-y-1">
                <div className="border-b border-black h-14" />
                <p className="font-bold text-black pt-1">Piloto / Despachador UMG</p>
                <p className="text-[8pt] text-gray-600">Sello y Firma de Salida</p>
              </div>

              <div className="space-y-1">
                <div className="border-b border-black h-14" />
                <p className="font-bold text-black pt-1">Firma de Recepción</p>
                <p className="text-[8pt] text-gray-600">Recibí conforme y sin daños</p>
              </div>
            </div>
          </div>
        </div>
      ) : searched && !loading ? (
        <div className="rounded-panel border border-border bg-surface p-6 text-center text-[13px] text-text-muted animate-in fade-in duration-150 no-print">
          No se encontró la guía #{guiaNumber}. Verifique el número e intente de nuevo.
        </div>
      ) : null}
      {/* Modal para Cambiar Estado Operativo */}
      {modalCambiarEstado && data && (
        <Modal
          isOpen={true}
          onClose={() => setModalCambiarEstado(false)}
          title={`Cambiar Estado Operativo - Guía #${data.numeroGuia}`}
          description="Transición en el flujo de cadena de custodia logística."
          maxWidth="sm"
        >
          <div className="space-y-4 text-[13px]">
            <div className="p-3 rounded bg-surface border border-border space-y-1">
              <span className="text-[11px] text-text-muted font-semibold uppercase">Estado actual:</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={data.estado} />
                <span className="text-xs text-text-muted font-mono">
                  {data.destinatario?.nombre || "Destinatario"}
                </span>
              </div>
            </div>

            <Select
              label="Nuevo estado de la guía"
              value={nuevoEstadoRastreo}
              onChange={(e) => setNuevoEstadoRastreo(e.target.value as EstadoGuia)}
            >
              <option value="Creada">Creada (En bodega inicial)</option>
              <option value="Despachada">Despachada (En tránsito vehicular)</option>
              <option value="Entregada">Entregada (Recepción final por destinatario)</option>
            </Select>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalCambiarEstado(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isActionLoading}
                onClick={handleActualizarEstado}
              >
                Guardar estado
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ConfirmDialog de Entrega Inmediata */}
      <ConfirmDialog
        isOpen={confirmEntregar}
        onClose={() => setConfirmEntregar(false)}
        onConfirm={handleMarcarEntregada}
        variant="primary"
        title="Confirmar Entrega de Paquete"
        message={`¿Desea marcar formalmente la guía #${data?.numeroGuia} como ENTREGADA?`}
        description="Esta acción actualizará la trazabilidad física a entregada con recepción conforme del cliente destinatario."
        confirmText="Confirmar Entrega"
        cancelText="Volver"
        isLoading={isActionLoading}
      />
    </div>
  );
}
