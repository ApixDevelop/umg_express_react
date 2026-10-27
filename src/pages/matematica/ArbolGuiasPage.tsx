import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { arbolApi } from "@/api/arbol";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import type { NodoArbolBST, Guia } from "@/types";
import {
  Network,
  Binary,
  Search,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2,
  PackageCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface LayoutNode {
  clave: number;
  x: number;
  y: number;
  izquierdo: LayoutNode | null;
  derecho: LayoutNode | null;
}

export function ArbolGuiasPage() {
  const [selectedGuia, setSelectedGuia] = useState<Guia | null>(null);
  const [searchNumero, setSearchNumero] = useState("");
  const [activeTraversal, setActiveTraversal] = useState<"inorder" | "preorder" | "postorder">("inorder");
  const [hoveredClave, setHoveredClave] = useState<number | null>(null);

  // 1. Métricas del Árbol
  const {
    data: metricas,
    isLoading: loadingMetricas,
    refetch: refetchMetricas,
  } = useQuery({
    queryKey: ["arbol", "metricas"],
    queryFn: () => arbolApi.obtenerMetricas(),
  });

  // 2. Estructura Jerárquica
  const {
    data: estructuraData,
    isLoading: loadingEstructura,
    refetch: refetchEstructura,
  } = useQuery({
    queryKey: ["arbol", "estructura"],
    queryFn: () => arbolApi.obtenerEstructura(),
  });

  // 3. Guías Ordenadas In-Order
  const {
    data: inorderData,
    isLoading: loadingInorder,
    refetch: refetchInorder,
  } = useQuery({
    queryKey: ["arbol", "inorder"],
    queryFn: () => arbolApi.obtenerInOrder(),
  });

  // Búsqueda en el árbol
  const [busquedaResultado, setBusquedaResultado] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent, customNum?: number) => {
    if (e) e.preventDefault();
    const target = customNum || parseInt(searchNumero, 10);
    if (!target || isNaN(target)) {
      toast.error("Ingrese un número de guía válido");
      return;
    }

    setIsSearching(true);
    try {
      const res = await arbolApi.buscarGuia(target);
      if (res.success && res.guia) {
        setBusquedaResultado(res);
        setSelectedGuia(res.guia);
        toast.success(`Guía #${target} localizada en ${res.comparacionesRealizadas} comparación(es)`);
      } else {
        setBusquedaResultado(null);
        toast.error(`Guía #${target} no existe en el árbol binario`);
      }
    } catch (err: any) {
      setBusquedaResultado(null);
      toast.error(err.response?.data?.error || `Guía #${target} no encontrada`);
    } finally {
      setIsSearching(false);
    }
  };

  const reloadAll = () => {
    refetchMetricas();
    refetchEstructura();
    refetchInorder();
    toast.info("Estructura de árbol actualizada desde disco");
  };

  // Calcular coordenadas SVG para el árbol binario
  const layoutTree = useMemo(() => {
    const root = estructuraData?.arbol;
    if (!root) return null;

    let nextX = 40;
    const horizontalGap = 80;
    const verticalGap = 70;

    function buildLayout(node: NodoArbolBST | null, depth: number): LayoutNode | null {
      if (!node) return null;

      // In-order traversal to compute natural X positions
      const leftLayout = buildLayout(node.izquierdo, depth + 1);

      const currentX = leftLayout ? nextX : nextX;
      nextX += horizontalGap;

      const rightLayout = buildLayout(node.derecho, depth + 1);

      // Centered between children if both exist
      let finalX = currentX;
      if (leftLayout && rightLayout) {
        finalX = (leftLayout.x + rightLayout.x) / 2;
      } else if (leftLayout) {
        finalX = leftLayout.x + horizontalGap / 2;
      } else if (rightLayout) {
        finalX = rightLayout.x - horizontalGap / 2;
      }

      return {
        clave: node.clave,
        x: Math.max(finalX, 50),
        y: depth * verticalGap + 50,
        izquierdo: leftLayout,
        derecho: rightLayout,
      };
    }

    const calculated = buildLayout(root, 0);
    return { root: calculated, totalWidth: Math.max(nextX + 60, 600), totalHeight: (metricas?.altura || 3) * 75 + 100 };
  }, [estructuraData, metricas]);

  // Encontrar detalles de guía para una clave
  const getGuiaByClave = (clave: number): Guia | undefined => {
    return inorderData?.guias.find((g) => g.numeroGuia === clave);
  };

  return (
    <div className="space-y-5">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-text tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-accent" />
              Árbol Binario de Búsqueda (BST) de Guías
            </h1>
            <Badge variant="default">Matemática Discreta</Badge>
            <Badge variant="info">Recursividad</Badge>
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">
            Indexación recursiva en memoria de registros de paquetería desde archivos binarios planos (.DAT) con complejidad logarítmica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reloadAll}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Actualizar Árbol
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Matemática Discreta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cardinalidad |V|</span>
            <Binary className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2">
            <div className="text-[22px] font-bold text-text tabular-nums">
              {metricas?.totalNodos ?? (loadingMetricas ? "..." : 0)}
            </div>
            <p className="text-[11px] text-text-faint mt-0.5">Vértices indexados</p>
          </div>
        </div>

        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-medium uppercase tracking-wider">Altura Recursiva</span>
            <Layers className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2">
            <div className="text-[22px] font-bold text-text tabular-nums">
              {metricas?.altura ?? (loadingMetricas ? "..." : 0)}
            </div>
            <p className="text-[11px] text-text-faint mt-0.5">Nivel máximo de profundidad</p>
          </div>
        </div>

        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-medium uppercase tracking-wider">Complejidad</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-[20px] font-bold text-emerald-500 font-mono">
              O(log₂ n)
            </div>
            <p className="text-[11px] text-text-faint mt-0.5">Búsqueda binaria recursiva</p>
          </div>
        </div>

        <div className="p-3.5 rounded-panel border border-border bg-surface flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-medium uppercase tracking-wider">Teorema In-Order</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2">
            <div className="text-[14px] font-semibold text-accent">
              Orden Ascendente
            </div>
            <p className="text-[11px] text-text-faint mt-0.5">Garantía matemática formal</p>
          </div>
        </div>
      </div>

      {/* Sección Interactiva: Simulador de Búsqueda Binaria */}
      <div className="p-4 rounded-panel border border-border bg-surface shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-[14px] font-semibold text-text flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-accent" />
              Simulador de Búsqueda Binaria Recursiva en BST
            </h2>
            <p className="text-[12px] text-text-muted">
              Comprueba cómo el algoritmo desciende recursivamente por subárboles comparando claves.
            </p>
          </div>

          {/* Botones de sugerencias de claves */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-text-faint">Probar con:</span>
            {metricas?.recorridoInOrder.slice(0, 5).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setSearchNumero(num.toString());
                  handleSearch(undefined, num);
                }}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-surface-hover hover:bg-accent/10 hover:text-accent border border-border transition-colors cursor-pointer"
              >
                #{num}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => handleSearch(e)} className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="number"
              value={searchNumero}
              onChange={(e) => setSearchNumero(e.target.value)}
              placeholder="Número de guía a buscar..."
              className="w-full h-8 pl-8.5 pr-3 text-[13px] bg-surface rounded-control border border-border-input focus:outline-none focus:border-accent text-text"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" isLoading={isSearching}>
            Buscar en O(log n)
          </Button>
        </form>

        {busquedaResultado && (
          <div className="p-3 rounded-control bg-accent/5 border border-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-text">
                  Guía #{busquedaResultado.guia?.numeroGuia} encontrada exitosamente
                </p>
                <p className="text-text-muted text-[11px]">
                  Algoritmo: <span className="font-mono text-accent">{busquedaResultado.algoritmo}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded bg-surface border border-border text-center">
                <div className="text-[10px] text-text-faint uppercase font-medium">Comparaciones</div>
                <div className="text-[14px] font-bold text-accent tabular-nums">
                  {busquedaResultado.comparacionesRealizadas}
                </div>
              </div>

              <div className="px-2.5 py-1 rounded bg-surface border border-border text-center">
                <div className="text-[10px] text-text-faint uppercase font-medium">Vs Búsqueda Lineal</div>
                <div className="text-[14px] font-bold text-emerald-500 tabular-nums">
                  {busquedaResultado.totalNodosArbol} pasos
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lienzo Visualizador del Árbol (SVG Dinámico) */}
      <div className="rounded-panel border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
          <div>
            <h2 className="text-[14px] font-semibold text-text flex items-center gap-1.5">
              <Network className="w-4 h-4 text-accent" />
              Topología Gráfica del Árbol Binario de Búsqueda
            </h2>
            <p className="text-[12px] text-text-muted">
              Visualización jerárquica con enlaces de subárbol izquierdo (menores) y derecho (mayores).
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-text-faint">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> Nodo / Guía
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Seleccionado
            </span>
          </div>
        </div>

        {loadingEstructura ? (
          <div className="h-56 flex flex-col items-center justify-center gap-2 text-[13px] text-text-muted">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Generando topología del árbol binario...</span>
          </div>
        ) : !layoutTree || !layoutTree.root ? (
          <div className="h-40 flex items-center justify-center text-[13px] text-text-muted">
            No hay guías registradas para construir el árbol binario.
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-hidden pb-3">
            <svg
              width={layoutTree.totalWidth}
              height={layoutTree.totalHeight}
              className="mx-auto block select-none"
            >
              {/* Líneas de conexión (Aristas del grafo) */}
              {(() => {
                const lines: React.ReactNode[] = [];

                function drawLines(node: LayoutNode | null) {
                  if (!node) return;
                  if (node.izquierdo) {
                    lines.push(
                      <line
                        key={`line-left-${node.clave}-${node.izquierdo.clave}`}
                        x1={node.x}
                        y1={node.y}
                        x2={node.izquierdo.x}
                        y2={node.izquierdo.y}
                        stroke="var(--border)"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="transition-all"
                      />
                    );
                    drawLines(node.izquierdo);
                  }
                  if (node.derecho) {
                    lines.push(
                      <line
                        key={`line-right-${node.clave}-${node.derecho.clave}`}
                        x1={node.x}
                        y1={node.y}
                        x2={node.derecho.x}
                        y2={node.derecho.y}
                        stroke="var(--border)"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="transition-all"
                      />
                    );
                    drawLines(node.derecho);
                  }
                }

                drawLines(layoutTree.root);
                return lines;
              })()}

              {/* Nodos del Árbol (Vértices) */}
              {(() => {
                const nodes: React.ReactNode[] = [];

                function drawNodes(node: LayoutNode | null) {
                  if (!node) return;
                  const isSelected = selectedGuia?.numeroGuia === node.clave;
                  const isHovered = hoveredClave === node.clave;

                  nodes.push(
                    <g
                      key={`node-${node.clave}`}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer group"
                      onClick={() => {
                        const g = getGuiaByClave(node.clave);
                        if (g) setSelectedGuia(g);
                        handleSearch(undefined, node.clave);
                      }}
                      onMouseEnter={() => setHoveredClave(node.clave)}
                      onMouseLeave={() => setHoveredClave(null)}
                    >
                      {/* Círculo de Fondo y Borde */}
                      <circle
                        r={isSelected ? "22" : isHovered ? "20" : "18"}
                        fill="var(--surface)"
                        stroke={isSelected ? "var(--color-emerald-500, #10b981)" : isHovered ? "var(--accent)" : "var(--border)"}
                        strokeWidth={isSelected ? "3" : "2"}
                        className="transition-all duration-150 drop-shadow-sm"
                      />

                      {/* Texto de Clave de Guía */}
                      <text
                        textAnchor="middle"
                        dy="4"
                        className="font-mono text-[11px] font-bold fill-current text-text pointer-events-none"
                      >
                        {node.clave}
                      </text>

                      {/* Indicador de subárbol pequeño */}
                      <title>Guía #{node.clave} (Haga clic para detalles)</title>
                    </g>
                  );

                  drawNodes(node.izquierdo);
                  drawNodes(node.derecho);
                }

                drawNodes(layoutTree.root);
                return nodes;
              })()}
            </svg>
          </div>
        )}

        {/* Detalle de Guía Seleccionada */}
        {selectedGuia && (
          <div className="p-3.5 rounded-control bg-surface-hover/30 border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 font-bold font-mono">
                #{selectedGuia.numeroGuia}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text text-[13px]">
                    Guía #{selectedGuia.numeroGuia}
                  </span>
                  <StatusBadge status={selectedGuia.estado} />
                </div>
                <div className="text-text-muted text-[11px] mt-0.5">
                  Remitente: #{selectedGuia.idClienteRemitente} • Destinatario: #{selectedGuia.idClienteDestinatario} • Ruta: #{selectedGuia.idRuta}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[11px] text-text-faint block">Peso Facturable</span>
                <span className="font-medium text-text">{formatWeight(selectedGuia.pesoFacturableKg)}</span>
              </div>
              <div>
                <span className="text-[11px] text-text-faint block">Flete Total</span>
                <span className="font-bold text-accent text-[13px]">{formatCurrency(selectedGuia.costoTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recorridos Teóricos de Matemática Discreta */}
      <div className="p-4 rounded-panel border border-border bg-surface space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
          <div>
            <h2 className="text-[14px] font-semibold text-text flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-accent" />
              Recorridos Recursivos del Árbol Binario
            </h2>
            <p className="text-[12px] text-text-muted">
              Demostración práctica de los teoremas de recorrido en teoría de árboles y grafos acíclicos.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface-hover p-0.5 rounded-control border border-border">
            <button
              onClick={() => setActiveTraversal("inorder")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                activeTraversal === "inorder"
                  ? "bg-surface text-accent shadow-xs font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              In-Order (Ascendente)
            </button>
            <button
              onClick={() => setActiveTraversal("preorder")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                activeTraversal === "preorder"
                  ? "bg-surface text-accent shadow-xs font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Pre-Order
            </button>
            <button
              onClick={() => setActiveTraversal("postorder")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                activeTraversal === "postorder"
                  ? "bg-surface text-accent shadow-xs font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Post-Order
            </button>
          </div>
        </div>

        {/* Explicación Teórica */}
        <div className="text-[12px] text-text-muted bg-surface-hover/20 p-2.5 rounded-control border border-border flex items-start gap-2">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div>
            {activeTraversal === "inorder" && (
              <span>
                <strong>Teorema In-Order (Izquierda → Raíz → Derecha):</strong> En cualquier Árbol Binario de Búsqueda, el recorrido simétrico inorden visita los vértices en orden estrictamente creciente de sus claves, ordenando el catálogo en tiempo lineal <code className="text-accent font-mono">O(n)</code> sin comparaciones adicionales.
              </span>
            )}
            {activeTraversal === "preorder" && (
              <span>
                <strong>Recorrido Pre-Order (Raíz → Izquierda → Derecha):</strong> Visita primero el nodo actual antes de descender recursivamente. Es la base para serializar y clonar la topología estructural exacta del árbol en archivos o memoria.
              </span>
            )}
            {activeTraversal === "postorder" && (
              <span>
                <strong>Recorrido Post-Order (Izquierda → Derecha → Raíz):</strong> Procesa primero ambos subárboles antes de procesar el nodo padre. Es fundamental para algoritmos de eliminación y liberación segura de memoria dinámica.
              </span>
            )}
          </div>
        </div>

        {/* Secuencia de Claves */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-text-faint mr-1">Secuencia resultante:</span>
          {(() => {
            const list =
              activeTraversal === "inorder"
                ? metricas?.recorridoInOrder
                : activeTraversal === "preorder"
                ? metricas?.recorridoPreOrder
                : metricas?.recorridoPostOrder;

            if (!list || list.length === 0) {
              return <span className="text-[11px] text-text-faint italic">Sin nodos</span>;
            }

            return list.map((num, idx) => (
              <React.Fragment key={`${activeTraversal}-${num}-${idx}`}>
                <span
                  className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-all cursor-pointer ${
                    selectedGuia?.numeroGuia === num
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold"
                      : "bg-surface border-border text-text hover:border-accent"
                  }`}
                  onClick={() => {
                    const g = getGuiaByClave(num);
                    if (g) setSelectedGuia(g);
                    handleSearch(undefined, num);
                  }}
                >
                  {num}
                </span>
                {idx < list.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-text-faint shrink-0" />
                )}
              </React.Fragment>
            ));
          })()}
        </div>
      </div>

      {/* Tabla de Guías Ordenadas (In-Order) */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-text flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-accent" />
              Catálogo de Guías Ordenadas mediante Recorrido In-Order
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5">
              Resultado del endpoint <code className="font-mono text-accent">/v1/arbol/guias/inorder</code> ordenado de forma ascendente en tiempo lineal O(n).
            </p>
          </div>
          <span className="text-[11px] text-text-muted">
            Total: <strong>{inorderData?.total || 0}</strong> guías
          </span>
        </div>

        <div className="overflow-x-auto">
          {loadingInorder ? (
            <div className="p-8 text-center text-[12px] text-text-muted">Cargando guías...</div>
          ) : !inorderData || inorderData.guias.length === 0 ? (
            <div className="p-8 text-center text-[12px] text-text-muted">No hay guías registradas.</div>
          ) : (
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-border bg-surface-hover/30 text-text-muted text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2 px-3">No. Guía</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3">Remitente</th>
                  <th className="py-2 px-3">Destinatario</th>
                  <th className="py-2 px-3">Ruta</th>
                  <th className="py-2 px-3 text-right">Peso Real</th>
                  <th className="py-2 px-3 text-right">Peso Facturable</th>
                  <th className="py-2 px-3 text-right">Flete Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inorderData.guias.map((g) => (
                  <tr
                    key={g.numeroGuia}
                    onClick={() => {
                      setSelectedGuia(g);
                      handleSearch(undefined, g.numeroGuia);
                    }}
                    className={`hover:bg-surface-hover/40 transition-colors cursor-pointer ${
                      selectedGuia?.numeroGuia === g.numeroGuia ? "bg-accent/5 font-medium" : ""
                    }`}
                  >
                    <td className="py-2 px-3 font-mono font-semibold text-accent">
                      #{g.numeroGuia}
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={g.estado} />
                    </td>
                    <td className="py-2 px-3 text-text">Cliente #{g.idClienteRemitente}</td>
                    <td className="py-2 px-3 text-text">Cliente #{g.idClienteDestinatario}</td>
                    <td className="py-2 px-3 text-text-muted">Ruta #{g.idRuta}</td>
                    <td className="py-2 px-3 text-right text-text-muted tabular-nums">
                      {formatWeight(g.pesoRealKg)}
                    </td>
                    <td className="py-2 px-3 text-right text-text tabular-nums font-medium">
                      {formatWeight(g.pesoFacturableKg)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-accent tabular-nums">
                      {formatCurrency(g.costoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
