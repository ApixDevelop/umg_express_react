import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { reportesApi } from "@/api/reportes";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight, formatVolume } from "@/lib/utils";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Printer,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { RastreoInfo } from "@/types";

export function RastreoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGuia = searchParams.get("no") || "";
  const [guiaNumber, setGuiaNumber] = useState(initialGuia);
  const [data, setData] = useState<RastreoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchRastreo = async (num: number) => {
    if (!num || isNaN(num)) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await reportesApi.obtenerRastreo(num);
      setData(res);
      setSearchParams({ no: num.toString() });
    } catch (err: any) {
      setData(null);
      toast.error(err.message || "Guía no encontrada");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialGuia) {
      fetchRastreo(Number(initialGuia));
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guiaNumber.trim()) {
      toast.error("Ingrese un número de guía válido");
      return;
    }
    fetchRastreo(Number(guiaNumber));
  };

  // Determine timeline steps
  const isCreada = data !== null;
  const isDespachada = data?.despacho?.despachada || data?.estado === "Despachada" || data?.estado === "Entregada";
  const isEntregada = data?.estado === "Entregada";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Rastreo y Trazabilidad de Guía
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consulte en tiempo real el estado físico, flete y despacho de cualquier envío.
          </p>
        </div>
        {data && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
            className="no-print"
          >
            Imprimir Hoja de Rastreo
          </Button>
        )}
      </div>

      {/* Search Bar Card */}
      <Card className="p-6 no-print">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="number"
              value={guiaNumber}
              onChange={(e) => setGuiaNumber(e.target.value)}
              placeholder="Ingrese el número correlativo de guía (ej: 1001)..."
              className="w-full bg-slate-950/80 text-slate-100 text-sm sm:text-base rounded-xl border border-slate-700/80 pl-11 pr-4 py-3 focus:outline-none focus:border-amber-500 font-mono tracking-wider font-semibold"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Consultar Guía
          </Button>
        </form>
      </Card>

      {/* Tracking results */}
      {data ? (
        <div className="space-y-6">
          {/* Status banner with timeline */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5 mb-6">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">
                  Número de Guía
                </span>
                <h3 className="text-3xl font-black text-amber-400 font-mono">
                  #{data.numeroGuia}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={data.estado} />
                <span className="text-xs font-mono text-slate-400 font-bold">
                  Total: {formatCurrency(data.paquete.costoTotal)}
                </span>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {/* Step 1 */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isCreada
                      ? "bg-slate-900/90 border-emerald-500/40 text-slate-100"
                      : "bg-slate-950/40 border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">1. Recepción en Bodega</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Guía Emitida y Cubicada</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    El paquete fue registrado, medido y tarificado en la sucursal de origen.
                  </p>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isDespachada
                      ? "bg-slate-900/90 border-amber-500/40 text-slate-100"
                      : "bg-slate-950/40 border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                        isDespachada ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">2. Despacho / En Tránsito</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {isDespachada ? "Cargado en Vehículo" : "Pendiente de Despacho"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    {data.despacho?.despachada
                      ? `Despachado en unidad ${data.despacho.vehiculo?.placa || ""} el ${data.despacho.fechaDespacho || ""}`
                      : "A la espera de asignación vehicular en la bodega de origen."}
                  </p>
                </div>

                {/* Step 3 */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isEntregada
                      ? "bg-slate-900/90 border-emerald-500/40 text-slate-100"
                      : "bg-slate-950/40 border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                        isEntregada ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">3. Entrega a Destinatario</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Destino Final</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isEntregada ? "Entrega confirmada en destino." : "En proceso de tránsito y entrega."}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender and Receiver */}
            <Card className="p-6 space-y-4">
              <CardTitle>Participantes del Envío</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                    Remitente
                  </span>
                  <p className="font-bold text-slate-100 text-sm">
                    {data.remitente?.nombre || "N/A"}
                  </p>
                  <p className="text-slate-400">NIT: {data.remitente?.nit || "C/F"}</p>
                  <p className="text-slate-400">Tel: {data.remitente?.telefono || "N/A"}</p>
                  <p className="text-slate-400 text-[11px] truncate">{data.remitente?.direccion || ""}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                    Destinatario
                  </span>
                  <p className="font-bold text-slate-100 text-sm">
                    {data.destinatario?.nombre || "N/A"}
                  </p>
                  <p className="text-slate-400">NIT: {data.destinatario?.nit || "C/F"}</p>
                  <p className="text-slate-400">Tel: {data.destinatario?.telefono || "N/A"}</p>
                  <p className="text-slate-400 text-[11px] truncate">{data.destinatario?.direccion || ""}</p>
                </div>
              </div>
            </Card>

            {/* Package Physics */}
            <Card className="p-6 space-y-4">
              <CardTitle>Cubicaje y Tarificación del Paquete</CardTitle>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Dimensiones</span>
                  <span className="font-bold text-slate-200">
                    {data.paquete.largoCm}×{data.paquete.anchoCm}×{data.paquete.altoCm} cm
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Peso Real</span>
                  <span className="font-bold text-slate-200">
                    {formatWeight(data.paquete.pesoRealKg)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Peso Volumétrico</span>
                  <span className="font-bold text-amber-400">
                    {formatWeight(data.paquete.pesoVolumetricoKg)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 block font-bold">Peso Facturable</span>
                  <span className="font-extrabold text-amber-400 text-sm">
                    {formatWeight(data.paquete.pesoFacturableKg)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Route and Transport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Route */}
            <Card className="p-6 space-y-3">
              <CardTitle>Ruta y Trayecto</CardTitle>
              {data.ruta ? (
                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">ORIGEN</span>
                      <strong className="text-slate-100">{data.ruta.origen?.nombre || "Agencia Origen"}</strong>
                      <p className="text-[10px] text-slate-400">{data.ruta.origen?.direccion || ""}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-500" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">DESTINO</span>
                      <strong className="text-slate-100">{data.ruta.destino?.nombre || "Agencia Destino"}</strong>
                      <p className="text-[10px] text-slate-400">{data.ruta.destino?.direccion || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] px-1">
                    <span>Distancia: <strong>{data.ruta.distanciaKm} km</strong></span>
                    <span>Tarifa Base: <strong>{formatCurrency(data.ruta.tarifaBase)}</strong></span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Sin datos de ruta</p>
              )}
            </Card>

            {/* Vehicle & Pilot Dispatch */}
            <Card className="p-6 space-y-3">
              <CardTitle>Asignación de Transporte</CardTitle>
              {data.despacho?.despachada ? (
                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Unidad Vehicular:</span>
                      <strong className="text-amber-400 font-bold">{data.despacho.vehiculo?.placa}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Modelo / Marca:</span>
                      <span className="text-slate-200">{data.despacho.vehiculo?.marcaModelo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Piloto Asignado:</span>
                      <span className="text-slate-200">{data.despacho.piloto?.nombre || "No especificado"}</span>
                    </div>
                    {data.despacho.piloto?.telefono && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Contacto Piloto:</span>
                        <span className="text-slate-200">{data.despacho.piloto.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Fecha Despacho:</span>
                      <span className="text-emerald-400 font-semibold">{data.despacho.fechaDespacho}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Guía en espera de asignación a vehículo de reparto.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : searched && !loading ? (
        <Card className="p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Guía no encontrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Verifique que el número de guía ingresado exista en el archivo de registros y se encuentre activo.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
