import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { reportesApi } from "@/api/reportes";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { Search, Printer } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Rastreo de Guía</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Consulta del estado físico y despacho del envío por número correlativo
          </p>
        </div>
        {data && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="no-print text-xs"
          >
            Imprimir
          </Button>
        )}
      </div>

      {/* Buscador */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-4 no-print">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="number"
              value={guiaNumber}
              onChange={(e) => setGuiaNumber(e.target.value)}
              placeholder="Número de guía (ej: 1001)..."
              className="w-full bg-slate-900 text-slate-100 text-xs rounded-lg border border-slate-750 pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
          >
            Buscar
          </Button>
        </form>
      </div>

      {/* Resultado */}
      {data ? (
        <div className="space-y-4">
          {/* Resumen principal */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Guía</span>
                <span className="font-mono text-base font-semibold text-slate-100">
                  #{data.numeroGuia}
                </span>
                <StatusBadge status={data.estado} />
              </div>
              <div className="text-xs text-slate-300 tabular-nums">
                Costo total: <span className="font-medium text-slate-100">{formatCurrency(data.paquete.costoTotal)}</span>
              </div>
            </div>

            {/* Lista simple de estados */}
            <div className="pt-4">
              <h2 className="text-xs font-medium text-slate-300 mb-3">Historial de estados</h2>
              <ol className="relative border-l border-slate-800 ml-2 space-y-4 text-xs">
                {/* 1. Bodega */}
                <li className="ml-4">
                  <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-slate-800 bg-emerald-500" />
                  <p className="font-medium text-slate-200">En bodega</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Guía emitida y cubicada ({data.paquete.largoCm}×{data.paquete.anchoCm}×{data.paquete.altoCm} cm, {formatWeight(data.paquete.pesoFacturableKg)})
                  </p>
                </li>

                {/* 2. Tránsito */}
                <li className="ml-4">
                  <div
                    className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-slate-800 ${
                      data.despacho?.despachada || data.estado === "Despachada" || data.estado === "Entregada"
                        ? "bg-amber-500"
                        : "bg-slate-700"
                    }`}
                  />
                  <p className="font-medium text-slate-200">En tránsito</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {data.despacho?.despachada
                      ? `Despachada en vehículo ${data.despacho.vehiculo?.placa || ""} (${data.despacho.vehiculo?.marcaModelo || ""})${data.despacho.piloto ? ` - Piloto: ${data.despacho.piloto.nombre}` : ""} - ${data.despacho.fechaDespacho || ""}`
                      : "Pendiente de asignación vehicular"}
                  </p>
                </li>

                {/* 3. Entrega */}
                <li className="ml-4">
                  <div
                    className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-slate-800 ${
                      data.estado === "Entregada" ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  />
                  <p className="font-medium text-slate-200">Entregada</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {data.estado === "Entregada"
                      ? "Envío entregado al destinatario final"
                      : "Pendiente de entrega"}
                  </p>
                </li>
              </ol>
            </div>
          </div>

          {/* Datos del envío en 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Remitente y Destinatario */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-4 space-y-3">
              <h2 className="text-xs font-medium text-slate-300">Participantes</h2>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60">
                  <span className="text-[11px] text-slate-400 block">Remitente</span>
                  <p className="font-medium text-slate-200">{data.remitente?.nombre || "N/A"}</p>
                  <p className="text-slate-400 text-[11px]">NIT: {data.remitente?.nit || "C/F"} · Tel: {data.remitente?.telefono || "N/A"}</p>
                  {data.remitente?.direccion && (
                    <p className="text-slate-400 text-[11px] truncate">{data.remitente.direccion}</p>
                  )}
                </div>

                <div className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60">
                  <span className="text-[11px] text-slate-400 block">Destinatario</span>
                  <p className="font-medium text-slate-200">{data.destinatario?.nombre || "N/A"}</p>
                  <p className="text-slate-400 text-[11px]">NIT: {data.destinatario?.nit || "C/F"} · Tel: {data.destinatario?.telefono || "N/A"}</p>
                  {data.destinatario?.direccion && (
                    <p className="text-slate-400 text-[11px] truncate">{data.destinatario.direccion}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Paquete y Trayecto */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-4 space-y-3">
              <h2 className="text-xs font-medium text-slate-300">Detalles de carga y ruta</h2>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 space-y-1">
                  <span className="text-[11px] text-slate-400 block">Carga física</span>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Dimensiones:</span>
                    <span className="font-mono">{data.paquete.largoCm}×{data.paquete.anchoCm}×{data.paquete.altoCm} cm</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 tabular-nums">
                    <span>Peso real:</span>
                    <span>{formatWeight(data.paquete.pesoRealKg)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 tabular-nums">
                    <span>Peso volumétrico:</span>
                    <span>{formatWeight(data.paquete.pesoVolumetricoKg)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200 font-medium tabular-nums pt-1 border-t border-slate-800">
                    <span>Peso facturable:</span>
                    <span>{formatWeight(data.paquete.pesoFacturableKg)}</span>
                  </div>
                </div>

                {data.ruta && (
                  <div className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60">
                    <span className="text-[11px] text-slate-400 block">Trayecto</span>
                    <p className="font-medium text-slate-200">
                      {data.ruta.origen?.nombre || "Origen"} → {data.ruta.destino?.nombre || "Destino"}
                    </p>
                    <p className="text-slate-400 text-[11px] tabular-nums">
                      Distancia: {data.ruta.distanciaKm} km · Tarifa base: {formatCurrency(data.ruta.tarifaBase)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : searched && !loading ? (
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-8 text-center text-xs">
          <p className="text-slate-300 font-medium">Guía no encontrada</p>
          <p className="text-slate-500 mt-1">Verifique el número ingresado e intente de nuevo.</p>
        </div>
      ) : null}
    </div>
  );
}
