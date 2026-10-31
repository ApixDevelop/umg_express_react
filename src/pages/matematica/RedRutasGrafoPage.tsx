import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { sucursalesApi, rutasApi } from "@/api/catalogos";
import { GrafoLogistico, ResultadoDijkstra, ResultadoMST } from "@/lib/grafo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Sucursal, Ruta } from "@/types";
import {
  GitFork,
  Network,
  Route,
  Navigation,
  Clock,
  DollarSign,
  TrendingUp,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Maximize2,
  Share2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface PosicionNodo {
  id: number;
  nombre: string;
  x: number;
  y: number;
}

export function RedRutasGrafoPage() {
  const [origenId, setOrigenId] = useState<number | "">("");
  const [destinoId, setDestinoId] = useState<number | "">("");
  const [resultadoDijkstra, setResultadoDijkstra] = useState<ResultadoDijkstra | null>(null);
  const [activeTab, setActiveTab] = useState<"dijkstra" | "matriz" | "kruskal" | "grados">("dijkstra");
  const [showMST, setShowMST] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  // 1. Obtener Sucursales
  const { data: sucursales = [], isLoading: loadingSucursales } = useQuery({
    queryKey: ["sucursales"],
    queryFn: () => sucursalesApi.listar(),
  });

  // 2. Obtener Rutas
  const { data: rutas = [], isLoading: loadingRutas } = useQuery({
    queryKey: ["rutas"],
    queryFn: () => rutasApi.listar(),
  });

  // Construir instancia del Grafo Logístico
  const grafo = useMemo(() => {
    return new GrafoLogistico(sucursales, rutas);
  }, [sucursales, rutas]);

  const metricas = useMemo(() => {
    return grafo.obtenerMetricas();
  }, [grafo]);

  const mstResultado = useMemo(() => {
    return grafo.calcularKruskalMST();
  }, [grafo]);

  const matrizData = useMemo(() => {
    return grafo.generarMatrizAdyacencia();
  }, [grafo]);

  // Posicionar nodos en un layout circular o predefinido agradable en SVG
  const posicionesNodos = useMemo(() => {
    const width = 760;
    const height = 440;
    const cx = width / 2;
    const cy = height / 2;
    const radioX = 260;
    const radioY = 150;

    const n = sucursales.length;
    const mapa = new Map<number, PosicionNodo>();

    if (n === 0) return mapa;

    // Posiciones en elipse armónica para visualización limpia de grafos
    sucursales.forEach((s, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const x = Math.round(cx + radioX * Math.cos(angle));
      const y = Math.round(cy + radioY * Math.sin(angle));
      mapa.set(s.id, {
        id: s.id,
        nombre: s.nombre,
        x,
        y,
      });
    });

    return mapa;
  }, [sucursales]);

  // Manejar cálculo de Dijkstra
  const handleCalcularDijkstra = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origenId || !destinoId) {
      toast.error("Seleccione la sucursal de origen y destino");
      return;
    }
    if (origenId === destinoId) {
      toast.warning("El origen y destino seleccionados son la misma sucursal");
      return;
    }

    const res = grafo.calcularDijkstra(Number(origenId), Number(destinoId));
    setResultadoDijkstra(res);

    if (res.posible) {
      toast.success(
        `Ruta óptima calculada: ${res.distanciaTotalKm} km en ${res.caminoNodos.length - 1} tramo(s)`
      );
    } else {
      toast.error("No existe ruta de conexión en el grafo entre estas sucursales");
    }
  };

  const handleSeleccionarNodo = (id: number) => {
    if (!origenId || (origenId && destinoId)) {
      setOrigenId(id);
      setDestinoId("");
      setResultadoDijkstra(null);
      toast.info(`Origen fijado: ${grafo.getSucursal(id)?.nombre}`);
    } else if (origenId && !destinoId && origenId !== id) {
      setDestinoId(id);
      const res = grafo.calcularDijkstra(Number(origenId), id);
      setResultadoDijkstra(res);
      toast.success(`Ruta óptima calculada hacia ${grafo.getSucursal(id)?.nombre}`);
    }
  };

  // Determinar si una arista está en el camino Dijkstra activo
  const isEdgeInDijkstra = (origen: number, destino: number): boolean => {
    if (!resultadoDijkstra || !resultadoDijkstra.posible) return false;
    const camino = resultadoDijkstra.caminoNodos;
    for (let i = 0; i < camino.length - 1; i++) {
      if (
        (camino[i] === origen && camino[i + 1] === destino) ||
        (camino[i] === destino && camino[i + 1] === origen)
      ) {
        return true;
      }
    }
    return false;
  };

  // Determinar si una arista está en el MST de Kruskal
  const isEdgeInMST = (origen: number, destino: number): boolean => {
    if (!showMST) return false;
    return mstResultado.aristasMST.some(
      (a) =>
        (a.origenId === origen && a.destinoId === destino) ||
        (a.origenId === destino && a.destinoId === origen)
    );
  };

  const isLoading = loadingSucursales || loadingRutas;

  return (
    <div className="space-y-5">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-text tracking-tight flex items-center gap-2">
              <GitFork className="w-5 h-5 text-accent" />
              Red Topológica y Grafo de Rutas
            </h1>
            <Badge variant="default">Teoría de Grafos G = (V, E)</Badge>
            <Badge variant="info">Dijkstra O(V² + E)</Badge>
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">
            Modelado matemático de la red de transporte intersucursal, optimización de trayectorias mínimas y análisis de conectividad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showMST ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowMST((prev) => !prev)}
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
          >
            {showMST ? "Ocultar Árbol MST" : "Ver Árbol Mínimo (Kruskal)"}
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Teoría de Grafos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-medium uppercase tracking-wider">Vértices |V|</span>
            <Building2 className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2">
            <div className="text-[22px] font-bold text-text tabular-nums">
              {metricas.totalVertices}
            </div>
            <p className="text-[11px] text-text-faint mt-0.5">Sucursales en la red</p>
          </div>
        </div>

        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-medium uppercase tracking-wider">Aristas |E|</span>
            <Route className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2">
            <div className="text-[22px] font-bold text-text tabular-nums">
              {metricas.totalAristas}
            </div>
            <p className="text-[11px] text-text-faint mt-0.5">Rutas activas ponderadas</p>
          </div>
        </div>

        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-medium uppercase tracking-wider">Densidad Red</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-[22px] font-bold text-emerald-500 font-mono tabular-nums">
              {(metricas.densidad * 100).toFixed(0)}%
            </div>
            <p className="text-[11px] text-text-faint mt-0.5">Coeficiente de conectividad</p>
          </div>
        </div>

        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-medium uppercase tracking-wider">Hub Principal</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2">
            <div className="text-[13px] font-semibold text-accent truncate" title={metricas.hubPrincipal?.sucursal.nombre}>
              {metricas.hubPrincipal?.sucursal.nombre || "N/A"}
            </div>
            <p className="text-[11px] text-text-faint mt-0.5">
              Grado d(v) = {metricas.hubPrincipal?.grado || 0} conexiones
            </p>
          </div>
        </div>
      </div>

      {/* Simulador Interactivo de Ruta Óptima (Algoritmo de Dijkstra) */}
      <div className="p-4 rounded-panel border border-border bg-surface shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-[14px] font-semibold text-text flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-accent" />
              Simulador de Trayectoria Óptima (Algoritmo de Dijkstra)
            </h2>
            <p className="text-[12px] text-text-muted">
              Haga clic sobre los nodos del mapa o use los selectores para encontrar el camino con menor distancia total.
            </p>
          </div>

          {(origenId || destinoId) && (
            <button
              onClick={() => {
                setOrigenId("");
                setDestinoId("");
                setResultadoDijkstra(null);
              }}
              className="text-[11px] text-accent hover:underline cursor-pointer"
            >
              Limpiar selección
            </button>
          )}
        </div>

        <form onSubmit={handleCalcularDijkstra} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <label className="block text-[12px] font-medium text-text">Sucursal Origen</label>
            <select
              value={origenId}
              onChange={(e) => setOrigenId(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-8 px-2.5 text-[12px] bg-surface rounded-control border border-border-input text-text focus:outline-none focus:border-accent"
            >
              <option value="">Seleccione origen...</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === destinoId}>
                  #{s.id} - {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[12px] font-medium text-text">Sucursal Destino</label>
            <select
              value={destinoId}
              onChange={(e) => setDestinoId(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-8 px-2.5 text-[12px] bg-surface rounded-control border border-border-input text-text focus:outline-none focus:border-accent"
            >
              <option value="">Seleccione destino...</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === origenId}>
                  #{s.id} - {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Route className="w-3.5 h-3.5" />}
            disabled={!origenId || !destinoId || origenId === destinoId}
          >
            Calcular Camino Mínimo
          </Button>
        </form>

        {/* Tarjeta de Resultado de Dijkstra */}
        {resultadoDijkstra && (
          <div
            className={`p-3.5 rounded-control border animate-in fade-in duration-200 ${
              resultadoDijkstra.posible
                ? "bg-accent/5 border-accent/20"
                : "bg-danger/5 border-danger/20 text-danger"
            }`}
          >
            {resultadoDijkstra.posible ? (
              <div className="space-y-2.5 text-[12px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-accent/10 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-text text-[13px]">
                      Trayectoria Óptima Resuelta
                    </span>
                    <Badge variant="success">Dijkstra O(V² + E)</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-text tabular-nums">
                    <div>
                      <span className="text-[11px] text-text-faint block">Distancia Total</span>
                      <span className="font-bold text-accent text-[14px]">
                        {resultadoDijkstra.distanciaTotalKm} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-faint block">Tiempo Estimado</span>
                      <span className="font-medium">{resultadoDijkstra.tiempoEstimadoHoras} hrs</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-faint block">Flete Base Acumulado</span>
                      <span className="font-semibold">{formatCurrency(resultadoDijkstra.tarifaTotalBase)}</span>
                    </div>
                  </div>
                </div>

                {/* Camino Secuencial */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-text-faint mr-1">Ruta por tramos:</span>
                  {resultadoDijkstra.caminoNodos.map((id, idx) => {
                    const s = grafo.getSucursal(id);
                    const isLast = idx === resultadoDijkstra.caminoNodos.length - 1;
                    const arista = resultadoDijkstra.caminoAristas[idx];

                    return (
                      <React.Fragment key={`dijkstra-node-${id}-${idx}`}>
                        <span
                          className={`px-2.5 py-1 text-[11px] rounded-control border font-medium flex items-center gap-1 ${
                            idx === 0
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : isLast
                              ? "bg-accent/10 text-accent border-accent/30 font-bold"
                              : "bg-surface text-text border-border"
                          }`}
                        >
                          <Building2 className="w-3 h-3 opacity-70" />
                          <span>{s?.nombre || `#${id}`}</span>
                        </span>
                        {!isLast && arista && (
                          <div className="flex items-center gap-0.5 text-[10px] text-text-faint px-1 bg-surface-hover rounded">
                            <ArrowRight className="w-3 h-3 text-accent" />
                            <span className="font-mono">{arista.distanciaKm} km</span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[12px]">
                <Info className="w-4 h-4 text-danger" />
                <span>
                  No existe conectividad en el grafo entre la sucursal origen y la sucursal destino.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lienzo Gráfico de la Red (SVG Interactivo) */}
      <div className="rounded-panel border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
          <div>
            <h2 className="text-[14px] font-semibold text-text flex items-center gap-1.5">
              <Network className="w-4 h-4 text-accent" />
              Lienzo Topológico del Grafo de Transporte
            </h2>
            <p className="text-[12px] text-text-muted">
              Representación visual de vértices (sucursales) y aristas ponderadas (rutas). Haga clic para trazar trayectorias.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-text-faint flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-surface border-2 border-border inline-block" /> Nodo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Origen
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> Destino
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-accent inline-block" /> Camino Óptimo
            </span>
            {showMST && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Árbol Mínimo (Kruskal)
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-[13px] text-text-muted">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Cargando topología de rutas...</span>
          </div>
        ) : sucursales.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-[13px] text-text-muted">
            No hay sucursales registradas para construir la red.
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <svg
              viewBox="0 0 760 440"
              className="w-full max-w-[760px] mx-auto block select-none rounded-control bg-surface-hover/20 border border-border/50"
            >
              {/* Aristas del Grafo */}
              {grafo.getAristas().map((arista, idx) => {
                const posU = posicionesNodos.get(arista.origenId);
                const posV = posicionesNodos.get(arista.destinoId);
                if (!posU || !posV) return null;

                const isDijkstra = isEdgeInDijkstra(arista.origenId, arista.destinoId);
                const isMST = isEdgeInMST(arista.origenId, arista.destinoId);

                // Punto medio para etiqueta de distancia
                const midX = (posU.x + posV.x) / 2;
                const midY = (posU.y + posV.y) / 2;

                return (
                  <g key={`edge-${arista.rutaId}-${idx}`}>
                    <line
                      x1={posU.x}
                      y1={posU.y}
                      x2={posV.x}
                      y2={posV.y}
                      stroke={
                        isDijkstra
                          ? "var(--accent)"
                          : isMST
                          ? "#38bdf8"
                          : "var(--border)"
                      }
                      strokeWidth={isDijkstra ? "3.5" : isMST ? "2.5" : "1.5"}
                      strokeDasharray={isDijkstra ? undefined : isMST ? "4 2" : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Badge de distancia en la arista */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-18"
                        y="-8"
                        width="36"
                        height="16"
                        rx="4"
                        fill="var(--surface)"
                        stroke={isDijkstra ? "var(--accent)" : "var(--border)"}
                        strokeWidth="1"
                        className="transition-all"
                      />
                      <text
                        textAnchor="middle"
                        dy="3.5"
                        className={`text-[9px] font-mono select-none ${
                          isDijkstra
                            ? "fill-accent font-bold"
                            : "fill-text-muted"
                        }`}
                      >
                        {arista.distanciaKm}k
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Vértices del Grafo (Nodos) */}
              {sucursales.map((s) => {
                const pos = posicionesNodos.get(s.id);
                if (!pos) return null;

                const isOrigin = origenId === s.id;
                const isDest = destinoId === s.id;
                const inDijkstraPath = resultadoDijkstra?.caminoNodos.includes(s.id);
                const isHovered = hoveredNodeId === s.id;

                let fillColor = "var(--surface)";
                let strokeColor = "var(--border)";
                let strokeWidth = "2";

                if (isOrigin) {
                  strokeColor = "var(--color-emerald-500, #10b981)";
                  strokeWidth = "3.5";
                } else if (isDest) {
                  strokeColor = "var(--accent)";
                  strokeWidth = "3.5";
                } else if (inDijkstraPath) {
                  strokeColor = "var(--accent)";
                  strokeWidth = "2.5";
                } else if (isHovered) {
                  strokeColor = "var(--text)";
                  strokeWidth = "2";
                }

                return (
                  <g
                    key={`node-${s.id}`}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => handleSeleccionarNodo(s.id)}
                    onMouseEnter={() => setHoveredNodeId(s.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-pointer group"
                  >
                    {/* Círculo Principal */}
                    <circle
                      r={isOrigin || isDest ? "22" : isHovered ? "20" : "18"}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-200 drop-shadow-sm"
                    />

                    {/* Iniciales / ID */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      className={`text-[10px] font-mono font-bold fill-current pointer-events-none ${
                        isOrigin
                          ? "text-emerald-500"
                          : isDest
                          ? "text-accent"
                          : "text-text"
                      }`}
                    >
                      #{s.id}
                    </text>

                    {/* Etiqueta de Nombre de Sucursal */}
                    <text
                      textAnchor="middle"
                      dy="32"
                      className={`text-[11px] font-medium fill-current pointer-events-none transition-all ${
                        isOrigin || isDest || inDijkstraPath
                          ? "text-text font-bold"
                          : "text-text-muted group-hover:text-text"
                      }`}
                    >
                      {s.nombre.length > 15 ? `${s.nombre.slice(0, 14)}...` : s.nombre}
                    </text>

                    <title>{s.nombre} - Haga clic para seleccionar como origen/destino</title>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Pestañas Teóricas de Matemática Discreta y Grafos */}
      <div className="p-4 rounded-panel border border-border bg-surface space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
          <div>
            <h2 className="text-[14px] font-semibold text-text flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-accent" />
              Análisis Matemático de la Red Logística
            </h2>
            <p className="text-[12px] text-text-muted">
              Propiedades formales, matrices de adyacencia y optimización de conectividad estructural.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface-hover p-0.5 rounded-control border border-border">
            <button
              onClick={() => setActiveTab("dijkstra")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                activeTab === "dijkstra"
                  ? "bg-surface text-accent shadow-xs font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Dijkstra
            </button>
            <button
              onClick={() => setActiveTab("matriz")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                activeTab === "matriz"
                  ? "bg-surface text-accent shadow-xs font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Matriz de Adyacencia
            </button>
            <button
              onClick={() => setActiveTab("kruskal")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                activeTab === "kruskal"
                  ? "bg-surface text-accent shadow-xs font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Árbol Mínimo (Kruskal)
            </button>
            <button
              onClick={() => setActiveTab("grados")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                activeTab === "grados"
                  ? "bg-surface text-accent shadow-xs font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Grados de Vértices
            </button>
          </div>
        </div>

        {/* Pestaña: Dijkstra */}
        {activeTab === "dijkstra" && (
          <div className="space-y-2 text-[12px] text-text-muted bg-surface-hover/20 p-3 rounded-control border border-border">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-text">Fundamento Teórico del Algoritmo de Dijkstra:</strong> Dado un grafo conexo ponderado con pesos no negativos $w(u, v) ge 0$, el algoritmo calcula recursivamente el árbol de caminos más cortos desde el vértice raíz, garantizando optimalidad global mediante la técnica *Greedy* (voraz) de relajación de aristas.
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: Matriz de Adyacencia */}
        {activeTab === "matriz" && (
          <div className="space-y-3">
            <div className="text-[12px] text-text-muted bg-surface-hover/20 p-2.5 rounded-control border border-border flex items-start gap-2">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                <strong>Definición Formal:</strong> La matriz de adyacencia ponderada M (de dimensión n × n) representa las distancias directas en kilómetros entre la sucursal fila i y la sucursal columna j. Las celdas con guion (-) indican que no existe ruta directa inmediata.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/30 text-text-muted">
                    <th className="py-2 px-3 text-left font-semibold">Sucursal</th>
                    {matrizData.ids.map((id) => (
                      <th key={`th-${id}`} className="py-2 px-2 font-mono">
                        #{id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {matrizData.ids.map((idFila, i) => (
                    <tr key={`row-${idFila}`} className="hover:bg-surface-hover/40">
                      <td className="py-1.5 px-3 text-left font-sans font-medium text-text">
                        #{idFila} {matrizData.etiquetas[i]}
                      </td>
                      {matrizData.ids.map((idCol, j) => {
                        const val = matrizData.matriz[i][j];
                        const isDiag = i === j;
                        const isConnected = val > 0;

                        return (
                          <td
                            key={`cell-${idFila}-${idCol}`}
                            className={`py-1.5 px-2 tabular-nums ${
                              isDiag
                                ? "text-text-faint bg-surface-hover/10"
                                : isConnected
                                ? "text-accent font-bold"
                                : "text-text-faint/40"
                            }`}
                          >
                            {isConnected ? `${val}k` : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pestaña: Kruskal MST */}
        {activeTab === "kruskal" && (
          <div className="space-y-3">
            <div className="text-[12px] text-text-muted bg-surface-hover/20 p-2.5 rounded-control border border-border flex items-start gap-2">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <strong>Árbol de Expansión Mínima (MST):</strong> Subgrafo acíclico que interconecta todas las {metricas.totalVertices} sucursales minimizando la suma total de distancias. Elimina redundancias operativas y reduce la longitud de red a solo <strong>{mstResultado.distanciaTotalKm} km</strong> (Ahorro de {mstResultado.ahorroKm} km).
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
              {mstResultado.aristasMST.map((a, idx) => {
                const sOrig = grafo.getSucursal(a.origenId);
                const sDest = grafo.getSucursal(a.destinoId);

                return (
                  <div
                    key={`mst-item-${idx}`}
                    className="p-2.5 rounded bg-surface-hover/30 border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-text">{sOrig?.nombre}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="font-semibold text-text">{sDest?.nombre}</span>
                    </div>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums">
                      {a.distanciaKm} km
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pestaña: Grados de Vértices */}
        {activeTab === "grados" && (
          <div className="space-y-3">
            <div className="text-[12px] text-text-muted bg-surface-hover/20 p-2.5 rounded-control border border-border flex items-start gap-2">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                <strong>Grado de un Vértice d(v):</strong> Número de rutas conectadas directamente a una sucursal. Los vértices de mayor grado actúan como centros neurálgicos de transbordo (hubs logísticos).
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[12px]">
              {metricas.grados.map((item) => (
                <div
                  key={`grado-${item.sucursal.id}`}
                  className="p-2.5 rounded bg-surface-hover/30 border border-border flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium text-text block truncate" title={item.sucursal.nombre}>
                      #{item.sucursal.id} {item.sucursal.nombre}
                    </span>
                    <span className="text-[11px] text-text-faint">{item.sucursal.direccion}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold font-mono">
                      {item.grado} rutas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
