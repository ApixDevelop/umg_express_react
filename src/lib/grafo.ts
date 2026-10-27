import type { Sucursal, Ruta } from "@/types";

export interface AristaGrafo {
  rutaId: number;
  origenId: number;
  destinoId: number;
  distanciaKm: number;
  tarifaBase: number;
}

export interface ResultadoDijkstra {
  posible: boolean;
  origenId: number;
  destinoId: number;
  caminoNodos: number[];
  caminoAristas: AristaGrafo[];
  distanciaTotalKm: number;
  tiempoEstimadoHoras: number;
  tarifaTotalBase: number;
  nodosVisitados: number;
  pasos: Array<{
    nodoId: number;
    distanciaActual: number;
    descripcion: string;
  }>;
}

export interface ResultadoMST {
  aristasMST: AristaGrafo[];
  distanciaTotalKm: number;
  ahorroKm: number;
}

export class GrafoLogistico {
  private sucursales: Map<number, Sucursal> = new Map();
  private adyacencia: Map<number, AristaGrafo[]> = new Map();
  private todasAristas: AristaGrafo[] = [];

  constructor(sucursales: Sucursal[], rutas: Ruta[]) {
    // Registrar nodos
    for (const s of sucursales) {
      this.sucursales.set(s.id, s);
      this.adyacencia.set(s.id, []);
    }

    // Registrar aristas (rutas como grafo bidireccional/mixto para logística de retorno)
    for (const r of rutas) {
      const aristaDirecta: AristaGrafo = {
        rutaId: r.id,
        origenId: r.idSucursalOrigen,
        destinoId: r.idSucursalDestino,
        distanciaKm: r.distanciaKm,
        tarifaBase: r.tarifaBase,
      };

      const aristaRetorno: AristaGrafo = {
        rutaId: r.id,
        origenId: r.idSucursalDestino,
        destinoId: r.idSucursalOrigen,
        distanciaKm: r.distanciaKm,
        tarifaBase: r.tarifaBase,
      };

      if (this.adyacencia.has(r.idSucursalOrigen)) {
        this.adyacencia.get(r.idSucursalOrigen)!.push(aristaDirecta);
      }
      if (this.adyacencia.has(r.idSucursalDestino)) {
        this.adyacencia.get(r.idSucursalDestino)!.push(aristaRetorno);
      }

      this.todasAristas.push(aristaDirecta);
    }
  }

  public getSucursales(): Sucursal[] {
    return Array.from(this.sucursales.values());
  }

  public getAristas(): AristaGrafo[] {
    return this.todasAristas;
  }

  public getSucursal(id: number): Sucursal | undefined {
    return this.sucursales.get(id);
  }

  /**
   * Algoritmo de Dijkstra para encontrar el camino más corto ponderado por distanciaKm
   */
  public calcularDijkstra(origenId: number, destinoId: number): ResultadoDijkstra {
    if (!this.sucursales.has(origenId) || !this.sucursales.has(destinoId)) {
      return {
        posible: false,
        origenId,
        destinoId,
        caminoNodos: [],
        caminoAristas: [],
        distanciaTotalKm: 0,
        tiempoEstimadoHoras: 0,
        tarifaTotalBase: 0,
        nodosVisitados: 0,
        pasos: [],
      };
    }

    if (origenId === destinoId) {
      return {
        posible: true,
        origenId,
        destinoId,
        caminoNodos: [origenId],
        caminoAristas: [],
        distanciaTotalKm: 0,
        tiempoEstimadoHoras: 0,
        tarifaTotalBase: 0,
        nodosVisitados: 1,
        pasos: [{ nodoId: origenId, distanciaActual: 0, descripcion: "Origen es el mismo destino" }],
      };
    }

    const distancias: Map<number, number> = new Map();
    const previoNodo: Map<number, number | null> = new Map();
    const previaArista: Map<number, AristaGrafo | null> = new Map();
    const visitados: Set<number> = new Set();
    const pasos: Array<{ nodoId: number; distanciaActual: number; descripcion: string }> = [];

    for (const id of this.sucursales.keys()) {
      distancias.set(id, Infinity);
      previoNodo.set(id, null);
      previaArista.set(id, null);
    }
    distancias.set(origenId, 0);

    while (visitados.size < this.sucursales.size) {
      // Encontrar nodo no visitado con menor distancia
      let nodoActual: number | null = null;
      let menorDistancia = Infinity;

      for (const [id, d] of distancias.entries()) {
        if (!visitados.has(id) && d < menorDistancia) {
          menorDistancia = d;
          nodoActual = id;
        }
      }

      if (nodoActual === null || menorDistancia === Infinity) {
        break; // Todos los nodos restantes son inalcanzables
      }

      visitados.add(nodoActual);
      const nombreActual = this.sucursales.get(nodoActual)?.nombre || `#${nodoActual}`;
      pasos.push({
        nodoId: nodoActual,
        distanciaActual: menorDistancia,
        descripcion: `Visitando ${nombreActual} (Distancia acumulada: ${menorDistancia} km)`,
      });

      if (nodoActual === destinoId) {
        break; // Llegamos al destino óptimo
      }

      // Relajación de aristas adyacentes
      const vecinos = this.adyacencia.get(nodoActual) || [];
      for (const arista of vecinos) {
        const vecinoId = arista.destinoId;
        if (!visitados.has(vecinoId)) {
          const nuevaDistancia = distancias.get(nodoActual)! + arista.distanciaKm;
          if (nuevaDistancia < distancias.get(vecinoId)!) {
            distancias.set(vecinoId, nuevaDistancia);
            previoNodo.set(vecinoId, nodoActual);
            previaArista.set(vecinoId, arista);
          }
        }
      }
    }

    if (distancias.get(destinoId) === Infinity) {
      return {
        posible: false,
        origenId,
        destinoId,
        caminoNodos: [],
        caminoAristas: [],
        distanciaTotalKm: 0,
        tiempoEstimadoHoras: 0,
        tarifaTotalBase: 0,
        nodosVisitados: visitados.size,
        pasos,
      };
    }

    // Reconstruir camino
    const caminoNodos: number[] = [];
    const caminoAristas: AristaGrafo[] = [];
    let actual: number | null = destinoId;
    let tarifaTotalBase = 0;

    while (actual !== null) {
      caminoNodos.unshift(actual);
      const arista = previaArista.get(actual);
      if (arista) {
        caminoAristas.unshift(arista);
        tarifaTotalBase += arista.tarifaBase;
      }
      actual = previoNodo.get(actual) || null;
    }

    const distanciaTotalKm = distancias.get(destinoId)!;
    // Velocidad promedio logística estimada: 55 km/h
    const tiempoEstimadoHoras = Math.round((distanciaTotalKm / 55) * 10) / 10;

    return {
      posible: true,
      origenId,
      destinoId,
      caminoNodos,
      caminoAristas,
      distanciaTotalKm,
      tiempoEstimadoHoras,
      tarifaTotalBase,
      nodosVisitados: visitados.size,
      pasos,
    };
  }

  /**
   * Árbol de Expansión Mínima (Kruskal) usando Disjoint Set Union (DSU)
   */
  public calcularKruskalMST(): ResultadoMST {
    // Clonar y ordenar aristas por distancia ascendente
    const aristasOrdenadas = [...this.todasAristas].sort((a, b) => a.distanciaKm - b.distanciaKm);

    const padre: Map<number, number> = new Map();
    for (const id of this.sucursales.keys()) {
      padre.set(id, id);
    }

    function find(i: number): number {
      if (padre.get(i) === i) return i;
      const raiz = find(padre.get(i)!);
      padre.set(i, raiz);
      return raiz;
    }

    function union(i: number, j: number): boolean {
      const raizI = find(i);
      const raizJ = find(j);
      if (raizI !== raizJ) {
        padre.set(raizI, raizJ);
        return true;
      }
      return false;
    }

    const aristasMST: AristaGrafo[] = [];
    let distanciaTotalKm = 0;

    for (const arista of aristasOrdenadas) {
      if (union(arista.origenId, arista.destinoId)) {
        aristasMST.push(arista);
        distanciaTotalKm += arista.distanciaKm;
      }
    }

    const totalRedKm = this.todasAristas.reduce((acc, a) => acc + a.distanciaKm, 0);
    const ahorroKm = Math.max(0, totalRedKm - distanciaTotalKm);

    return {
      aristasMST,
      distanciaTotalKm,
      ahorroKm,
    };
  }

  /**
   * Generar Matriz de Adyacencia formal (Mn x n)
   */
  public generarMatrizAdyacencia(): { matriz: number[][]; etiquetas: string[]; ids: number[] } {
    const ids = Array.from(this.sucursales.keys()).sort((a, b) => a - b);
    const etiquetas = ids.map((id) => this.sucursales.get(id)?.nombre || `Sucursal #${id}`);
    const n = ids.length;

    const matriz: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    const idToIndex = new Map<number, number>();
    ids.forEach((id, idx) => idToIndex.set(id, idx));

    for (const arista of this.todasAristas) {
      const u = idToIndex.get(arista.origenId);
      const v = idToIndex.get(arista.destinoId);
      if (u !== undefined && v !== undefined) {
        matriz[u][v] = arista.distanciaKm;
        matriz[v][u] = arista.distanciaKm;
      }
    }

    return { matriz, etiquetas, ids };
  }

  /**
   * Métricas y grados de conectividad de los vértices
   */
  public obtenerMetricas(): {
    totalVertices: number;
    totalAristas: number;
    densidad: number;
    hubPrincipal: { sucursal: Sucursal; grado: number } | null;
    grados: Array<{ sucursal: Sucursal; grado: number }>;
  } {
    const n = this.sucursales.size;
    const m = this.todasAristas.length;

    const grados: Array<{ sucursal: Sucursal; grado: number }> = [];
    let maxGrado = -1;
    let hub: { sucursal: Sucursal; grado: number } | null = null;

    for (const [id, s] of this.sucursales.entries()) {
      const grado = this.adyacencia.get(id)?.length || 0;
      grados.push({ sucursal: s, grado });
      if (grado > maxGrado) {
        maxGrado = grado;
        hub = { sucursal: s, grado };
      }
    }

    grados.sort((a, b) => b.grado - a.grado);

    // Densidad para grafo no dirigido: 2 * E / (V * (V - 1))
    const maxAristasPosibles = n > 1 ? (n * (n - 1)) / 2 : 1;
    const densidad = n > 1 ? Math.min(1, Math.round((m / maxAristasPosibles) * 100) / 100) : 0;

    return {
      totalVertices: n,
      totalAristas: m,
      densidad,
      hubPrincipal: hub,
      grados,
    };
  }
}
