import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportesApi } from "@/api/reportes";
import { vehiculosApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { CapacityBar } from "@/components/ui/CapacityBar";
import { formatCurrency, formatWeight, formatVolume } from "@/lib/utils";
import type { ManifiestoInfo, Vehiculo } from "@/types";
import {
  Printer,
  Download,
  Truck,
  UserCheck,
  MapPin,
  Package,
  Weight,
  Layers,
  FileText,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export function ManifiestoPage() {
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<number>(0);

  const { data: vehiculos = [], isLoading: loadingVehiculos } = useQuery<Vehiculo[]>({
    queryKey: ["vehiculos"],
    queryFn: () => vehiculosApi.listar(),
  });

  const {
    data: manifiesto,
    isLoading: loadingManifiesto,
    isError,
    error,
  } = useQuery<ManifiestoInfo>({
    queryKey: ["manifiesto", selectedVehiculoId],
    queryFn: () => reportesApi.obtenerManifiesto(Number(selectedVehiculoId)),
    enabled: selectedVehiculoId > 0,
    retry: false,
  });

  const totalFlete = manifiesto?.guias.reduce((acc, g) => acc + (g.costoTotal || 0), 0) || 0;
  const currentVehiculo = vehiculos.find((v) => v.id === selectedVehiculoId);

  const exportCSV = () => {
    if (!manifiesto) return;
    const headers = [
      "No. Guia",
      "Estado",
      "Remitente",
      "Destinatario",
      "Peso Real (kg)",
      "Peso Volumetrico (kg)",
      "Peso Facturable (kg)",
      "Volumen (m3)",
      "Costo Flete (GTQ)"
    ];

    const rows = manifiesto.guias.map((g) => [
      g.numeroGuia,
      g.estado,
      `"${g.remitente?.nombre || "-"}"`,
      `"${g.destinatario?.nombre || "-"}"`,
      g.pesoRealKg || 0,
      g.pesoVolumetricoKg || 0,
      g.pesoFacturableKg || 0,
      g.volumenM3 || 0,
      (g.costoTotal || 0).toFixed(2),
    ]);

    const csvContent = [
      `"MANIFIESTO DE CARGA UMG EXPRESS"`,
      `"Vehiculo: ${manifiesto.vehiculo.placa} - ${manifiesto.vehiculo.marcaModelo}"`,
      `"Piloto: ${manifiesto.piloto?.nombre || "No Asignado"}"`,
      `"Fecha de Generacion: ${new Date().toISOString()}"`,
      "",
      headers.join(","),
      ...rows.map((r) => r.join(",")),
      "",
      `"TOTALES","","",${manifiesto.resumen.pesoTotalKg},${manifiesto.resumen.volumenTotalM3},${totalFlete.toFixed(2)}`
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `manifiesto_${manifiesto.vehiculo.placa}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
            {/* Encabezado Institucional para Impresión Oficial */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16pt] font-black text-black leading-none">
              UMG EXPRESS · MANIFIESTO OFICIAL DE CARGA
            </h2>
            <p className="text-[9pt] text-gray-700 tracking-wider uppercase font-semibold mt-1">
              Hoja de Ruta, Despacho y Cadena de Custodia Terrestre
            </p>
            <p className="text-[8.5pt] text-gray-600">
              República de Guatemala, C.A. · Transporte Pesado y Encomiendas
            </p>
          </div>
          <div className="text-right">
            <div className="border border-black px-3 py-1 font-mono font-bold text-[12pt] text-black bg-gray-50">
              MANIFIESTO #{manifiesto?.vehiculo?.id ? `${manifiesto.vehiculo.id}-${new Date().getFullYear()}` : "CARGA"}
            </div>
            <p className="text-[8.5pt] text-gray-600 mt-1">
              Fecha de emisión: {new Date().toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-text tracking-tight">Manifiesto de Carga</h1>
            <Badge variant="default">Documento Oficial</Badge>
          </div>
          <p className="text-[13px] text-text-muted mt-0.5">
            Cadena de custodia, asignación de estiba vehicular y hoja de ruta legal.
          </p>
        </div>

        {manifiesto && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Manifiesto</span>
            </Button>
          </div>
        )}
      </div>

      {/* Selector de Unidad Vehicular */}
      <div className="rounded-panel border border-border bg-surface p-3.5 no-print">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="w-full md:max-w-md">
            <Select
              label="Seleccionar Unidad Vehicular para Despacho"
              value={selectedVehiculoId}
              onChange={(e) => setSelectedVehiculoId(Number(e.target.value))}
            >
              <option value="0">-- Seleccione una unidad de la flota --</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} · {v.marcaModelo} ({v.estado})
                </option>
              ))}
            </Select>
          </div>

          {currentVehiculo && (
            <div className="flex items-center gap-2 text-[12px] bg-surface-hover/80 border border-border px-3 py-1.5 rounded-control">
              <Truck className="w-3.5 h-3.5 text-accent" />
              <span className="font-semibold text-text">{currentVehiculo.placa}</span>
              <span className="text-text-muted">|</span>
              <span className="text-text-muted">Cap. Máx:</span>
              <span className="font-mono text-text font-medium">{formatWeight(currentVehiculo.capacidadPesoKg)}</span>
              <span className="text-text-muted">·</span>
              <span className="font-mono text-text font-medium">{formatVolume(currentVehiculo.capacidadVolumenM3)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Vista si no hay vehículo seleccionado */}
      {selectedVehiculoId === 0 ? (
        <div className="rounded-panel border border-border bg-surface p-8 text-center space-y-4 no-print">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-[15px] font-semibold text-text">Seleccione una unidad vehicular</h3>
            <p className="text-[13px] text-text-muted">
              Elija un vehículo para cargar y auditar la hoja de ruta con el detalle de las guías consolidadas.
            </p>
          </div>

          {/* Quick-Pick de unidades disponibles */}
          <div className="pt-2 max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold text-text-faint uppercase tracking-wider mb-2.5">
              Unidades en Flota ({vehiculos.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-left">
              {vehiculos.slice(0, 6).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehiculoId(v.id)}
                  className="p-2.5 rounded-control border border-border bg-surface-hover/40 hover:bg-surface-hover hover:border-accent/50 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[13px] text-text group-hover:text-accent">
                      {v.placa}
                    </span>
                    <Badge variant={v.estado === "Disponible" ? "success" : v.estado === "En ruta" ? "info" : "warning"}>
                      {v.estado}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-muted truncate mt-1">{v.marcaModelo}</p>
                  <div className="mt-2 pt-1 border-t border-border/50 text-[11px] text-text-faint font-mono">
                    {formatWeight(v.capacidadPesoKg)} · {formatVolume(v.capacidadVolumenM3)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : loadingManifiesto ? (
        <div className="rounded-panel border border-border bg-surface p-12 text-center text-[13px] text-text-muted flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Generando y consolidando manifiesto de carga...</span>
        </div>
      ) : isError ? (
        <div className="rounded-panel border border-danger/30 bg-danger/5 p-6 text-center space-y-2 no-print">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <h3 className="text-[14px] font-semibold text-danger">Error al generar manifiesto</h3>
          <p className="text-[13px] text-text-muted">
            {(error as any)?.message || "No fue posible generar el manifiesto para el vehículo seleccionado."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedVehiculoId(0)}
            className="mt-2"
          >
            Seleccionar otro vehículo
          </Button>
        </div>
      ) : manifiesto ? (
        <div className="rounded-panel border border-border bg-surface p-6 space-y-6 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
          {/* Encabezado Oficial del Documento */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b-2 border-border gap-4 print:border-black">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-accent text-white flex items-center justify-center font-black text-[12px] print:bg-black">
                  U
                </div>
                <span className="font-bold tracking-tight text-[15px] text-text print:text-black">
                  UMG EXPRESS · LOGÍSTICA & TRANSPORTE
                </span>
              </div>
              <p className="text-[12px] text-text-muted print:text-gray-600 font-mono">
                FOLIO: MNF-{manifiesto.vehiculo.placa}-{new Date().getFullYear()} · GUATEMALA, C.A.
              </p>
              <h2 className="text-[18px] font-bold text-text pt-0.5 print:text-black">
                Manifiesto Oficial de Carga y Ruta
              </h2>
            </div>

            <div className="text-[12px] space-y-1 sm:text-right print:text-right">
              <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 print:border-black print:text-black print:bg-transparent">
                Despacho Autorizado
              </div>
              <p className="text-text-muted print:text-gray-600">
                Fecha emisión:{" "}
                <span className="font-mono text-text font-medium print:text-black">
                  {new Date().toLocaleDateString("es-GT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
              <p className="text-text-muted print:text-gray-600">
                Hora registro:{" "}
                <span className="font-mono text-text font-medium print:text-black">
                  {new Date().toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </p>
            </div>
          </div>

          {/* Ficha Técnica de Despacho (Vehículo, Piloto, Ruta) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3">
            {/* Vehículo */}
            <div className="p-3 rounded-control border border-border bg-surface-hover/30 space-y-1.5 print:border-black print:bg-transparent">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted print:text-black">
                <Truck className="w-3.5 h-3.5 text-accent print:text-black" />
                <span>Unidad Asignada</span>
              </div>
              <div className="font-mono font-bold text-[15px] text-text print:text-black">
                {manifiesto.vehiculo.placa}
              </div>
              <p className="text-[12px] text-text-muted print:text-gray-700">
                {manifiesto.vehiculo.marcaModelo}
              </p>
              <div className="text-[11px] font-mono text-text-faint pt-1 border-t border-border/40 print:border-gray-300 print:text-gray-600">
                Cap. Máx: {formatWeight(manifiesto.vehiculo.capacidadPesoKg)} · {formatVolume(manifiesto.vehiculo.capacidadVolumenM3)}
              </div>
            </div>

            {/* Piloto */}
            <div className="p-3 rounded-control border border-border bg-surface-hover/30 space-y-1.5 print:border-black print:bg-transparent">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted print:text-black">
                <UserCheck className="w-3.5 h-3.5 text-accent print:text-black" />
                <span>Piloto Responsable</span>
              </div>
              <div className="font-semibold text-[14px] text-text print:text-black">
                {manifiesto.piloto?.nombre || "No Asignado"}
              </div>
              <p className="text-[12px] text-text-muted print:text-gray-700 font-mono">
                Licencia: {manifiesto.piloto?.licencia || "N/A"}
              </p>
              <div className="text-[11px] font-mono text-text-faint pt-1 border-t border-border/40 print:border-gray-300 print:text-gray-600">
                Tel: {manifiesto.piloto?.telefono || "N/A"}
              </div>
            </div>

            {/* Ruta */}
            <div className="p-3 rounded-control border border-border bg-surface-hover/30 space-y-1.5 print:border-black print:bg-transparent">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted print:text-black">
                <MapPin className="w-3.5 h-3.5 text-accent print:text-black" />
                <span>Ruta y Trayecto</span>
              </div>
              <div className="font-semibold text-[13px] text-text flex items-center gap-1.5 print:text-black">
                <span>{manifiesto.ruta?.sucursalOrigen?.nombre || "Origen"}</span>
                <span className="text-accent font-bold print:text-black">→</span>
                <span>{manifiesto.ruta?.sucursalDestino?.nombre || "Destino"}</span>
              </div>
              <p className="text-[12px] text-text-muted print:text-gray-700">
                Ruta #{manifiesto.ruta?.id || "N/A"}
              </p>
              <div className="text-[11px] font-mono text-text-faint pt-1 border-t border-border/40 print:border-gray-300 print:text-gray-600">
                Despacho directo interdepartamental
              </div>
            </div>
          </div>

          {/* Radar Telemetría de Carga */}
          <div className="p-3.5 rounded-control border border-border bg-surface space-y-3 print:border-black print:p-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-text print:text-black">
                Balance de Ocupación de la Unidad
              </h3>
              <span className="text-[12px] font-medium text-text-muted print:text-black">
                {manifiesto.resumen.totalGuias} encomiendas a bordo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted font-medium print:text-black">Carga en Peso:</span>
                  <span className="font-mono font-semibold text-text print:text-black">
                    {formatWeight(manifiesto.resumen.pesoTotalKg)} / {formatWeight(manifiesto.vehiculo.capacidadPesoKg)}
                  </span>
                </div>
                <CapacityBar
                  label="Carga en Peso"
                  current={manifiesto.resumen.pesoTotalKg}
                  max={manifiesto.vehiculo.capacidadPesoKg}
                  unit="kg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted font-medium print:text-black">Ocupación Cúbica:</span>
                  <span className="font-mono font-semibold text-text print:text-black">
                    {formatVolume(manifiesto.resumen.volumenTotalM3)} / {formatVolume(manifiesto.vehiculo.capacidadVolumenM3)}
                  </span>
                </div>
                <CapacityBar
                  label="Ocupación Cúbica"
                  current={manifiesto.resumen.volumenTotalM3}
                  max={manifiesto.vehiculo.capacidadVolumenM3}
                  unit="m³"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Guías */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-text uppercase tracking-wider print:text-black">
                Detalle de Encomiendas y Paquetes ({manifiesto.guias.length})
              </h3>
              <span className="text-[12px] font-mono text-text-muted print:text-black">
                Flete consolidado: <strong className="text-text print:text-black">{formatCurrency(totalFlete)}</strong>
              </span>
            </div>

            <div className="overflow-x-auto rounded-control border border-border print:border-black">
              <table className="w-full text-left text-[12px] border-collapse print:text-[11px]">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/60 text-text-muted text-[11px] font-bold uppercase tracking-wider print:border-black print:bg-gray-100 print:text-black">
                    <th className="py-2 px-3 font-semibold">No. Guía</th>
                    <th className="py-2 px-3 font-semibold">Remitente</th>
                    <th className="py-2 px-3 font-semibold">Destinatario</th>
                    <th className="py-2 px-3 text-right font-semibold">Peso (kg)</th>
                    <th className="py-2 px-3 text-right font-semibold">Volumen (m³)</th>
                    <th className="py-2 px-3 text-right font-semibold">Flete</th>
                    <th className="py-2 px-3 text-center font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-black">
                  {manifiesto.guias.map((g) => (
                    <tr key={g.numeroGuia} className="hover:bg-surface-hover/40 transition-colors h-9">
                      <td className="py-2 px-3 font-mono font-bold text-text tabular-nums print:text-black">
                        #{g.numeroGuia}
                      </td>
                      <td className="py-2 px-3 text-text truncate max-w-[150px] print:text-black">
                        {g.remitente?.nombre || "-"}
                      </td>
                      <td className="py-2 px-3 text-text truncate max-w-[150px] print:text-black">
                        {g.destinatario?.nombre || "-"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-text tabular-nums print:text-black">
                        {formatWeight(g.pesoFacturableKg)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-text-muted tabular-nums print:text-black">
                        {formatVolume(g.volumenM3)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-text tabular-nums print:text-black">
                        {formatCurrency(g.costoTotal)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-hover text-text-muted border border-border print:border-black print:text-black">
                          {g.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-border bg-surface-hover/80 text-text font-semibold text-[12px] print:border-black print:bg-gray-100 print:text-black">
                  <tr>
                    <td className="py-2.5 px-3" colSpan={3}>
                      TOTALES CONSOLIDADOS ({manifiesto.resumen.totalGuias} paquetes)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {formatWeight(manifiesto.resumen.pesoTotalKg)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {formatVolume(manifiesto.resumen.volumenTotalM3)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-accent font-bold print:text-black">
                      {formatCurrency(totalFlete)}
                    </td>
                    <td className="py-2.5 px-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bloque Legal de Firmas Oficiales y Sello */}
          <div className="pt-6 border-t border-border print:border-black">
            <p className="text-[11px] text-text-muted text-center mb-6 print:text-black">
              El presente manifiesto certifica la entrega, estiba y responsabilidad de la carga en tránsito
              conforme a las leyes de transporte terrestre de la República de Guatemala.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-[12px] print:grid-cols-3">
              <div className="space-y-1">
                <div className="border-b border-border-input print:border-black h-12" />
                <p className="font-semibold text-text print:text-black pt-1">
                  {manifiesto.piloto?.nombre || "Piloto Responsable"}
                </p>
                <p className="text-[11px] text-text-muted print:text-gray-600">
                  Firma Conforme de Piloto (Lic. {manifiesto.piloto?.licencia || "N/A"})
                </p>
              </div>

              <div className="space-y-1">
                <div className="border-b border-border-input print:border-black h-12" />
                <p className="font-semibold text-text print:text-black pt-1">
                  Despachador Autorizado
                </p>
                <p className="text-[11px] text-text-muted print:text-gray-600">
                  Firma y Sello de Bahía Origen
                </p>
              </div>

              <div className="space-y-1">
                <div className="border-b border-border-input print:border-black h-12" />
                <p className="font-semibold text-text print:text-black pt-1">
                  Receptor de Destino
                </p>
                <p className="text-[11px] text-text-muted print:text-gray-600">
                  Firma de Conformidad en Arribo
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
