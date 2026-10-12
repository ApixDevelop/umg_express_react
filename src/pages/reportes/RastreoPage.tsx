import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { reportesApi } from "@/api/reportes";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { Search } from "lucide-react";
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
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text">Rastreo de guía</h1>
        {data && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="no-print"
          >
            Imprimir
          </Button>
        )}
      </div>

      {/* Buscador */}
      <div className="rounded-panel border border-border bg-surface p-3 no-print">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="number"
              value={guiaNumber}
              onChange={(e) => setGuiaNumber(e.target.value)}
              placeholder="Número de guía"
              className="w-full h-8 bg-surface text-text text-[13px] rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:ring-2 focus:ring-accent tabular-nums"
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
          {/* Historial de estados directo */}
          <div className="rounded-panel border border-border bg-surface p-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-text-muted">Guía</span>
                <span className="text-[16px] font-semibold text-text tabular-nums">
                  #{data.numeroGuia}
                </span>
                <StatusBadge status={data.estado} />
              </div>
              <div className="text-[13px] text-text tabular-nums">
                Costo: <span className="font-semibold">{formatCurrency(data.paquete.costoTotal)}</span>
              </div>
            </div>

            <div className="pt-3">
              <div className="text-[12px] text-text-muted mb-2">Estados del envío</div>
              <div className="space-y-2 border-l border-border ml-2 pl-3 text-[13px]">
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

          {/* Detalles del envío */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div className="rounded-panel border border-border bg-surface p-4 space-y-2">
              <h2 className="text-[14px] font-semibold text-text">Participantes</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-[12px] text-text-muted block">Remitente</span>
                  <p className="font-medium text-text">{data.remitente?.nombre || "N/A"}</p>
                  <p className="text-[12px] text-text-muted">NIT: {data.remitente?.nit || "C/F"} · Tel: {data.remitente?.telefono || "N/A"}</p>
                  {data.remitente?.direccion && (
                    <p className="text-[12px] text-text-faint truncate">{data.remitente.direccion}</p>
                  )}
                </div>
                <div className="pt-2 border-t border-border">
                  <span className="text-[12px] text-text-muted block">Destinatario</span>
                  <p className="font-medium text-text">{data.destinatario?.nombre || "N/A"}</p>
                  <p className="text-[12px] text-text-muted">NIT: {data.destinatario?.nit || "C/F"} · Tel: {data.destinatario?.telefono || "N/A"}</p>
                  {data.destinatario?.direccion && (
                    <p className="text-[12px] text-text-faint truncate">{data.destinatario.direccion}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-panel border border-border bg-surface p-4 space-y-2">
              <h2 className="text-[14px] font-semibold text-text">Detalles de carga y ruta</h2>
              <div className="space-y-1.5 tabular-nums">
                <div className="flex justify-between text-text">
                  <span className="text-text-muted">Dimensiones:</span>
                  <span>{data.paquete.largoCm}×{data.paquete.anchoCm}×{data.paquete.altoCm} cm</span>
                </div>
                <div className="flex justify-between text-text">
                  <span className="text-text-muted">Peso real:</span>
                  <span>{formatWeight(data.paquete.pesoRealKg)}</span>
                </div>
                <div className="flex justify-between text-text">
                  <span className="text-text-muted">Peso facturable:</span>
                  <span className="font-medium">{formatWeight(data.paquete.pesoFacturableKg)}</span>
                </div>
                {data.ruta && (
                  <div className="pt-2 border-t border-border space-y-0.5">
                    <span className="text-[12px] text-text-muted block">Ruta</span>
                    <p className="font-medium text-text">
                      {data.ruta.origen?.nombre || "Origen"} → {data.ruta.destino?.nombre || "Destino"}
                    </p>
                    <p className="text-[12px] text-text-muted">
                      Distancia: {data.ruta.distanciaKm} km · Tarifa base: {formatCurrency(data.ruta.tarifaBase)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : searched && !loading ? (
        <div className="rounded-panel border border-border bg-surface p-6 text-center text-[13px] text-text-muted">
          No se encontró la guía #{guiaNumber}. Verifique el número e intente de nuevo.
        </div>
      ) : null}
    </div>
  );
}