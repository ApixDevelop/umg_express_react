import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rutasApi, sucursalesApi } from "@/api/catalogos";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Edit2, Trash2, MapPin, Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { Ruta } from "@/types";

export function RutasPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ruta | null>(null);

  const [idOrigen, setIdOrigen] = useState<number>(0);
  const [idDestino, setIdDestino] = useState<number>(0);
  const [distanciaKm, setDistanciaKm] = useState<number>(50);
  const [tarifaBase, setTarifaBase] = useState<number>(45);

  const { data: rutas = [], isLoading } = useQuery({
    queryKey: ["rutas"],
    queryFn: () => rutasApi.listar(),
  });

  const { data: sucursales = [] } = useQuery({
    queryKey: ["sucursales"],
    queryFn: () => sucursalesApi.listar(),
  });

  const sucursalesMap = useMemo(() => {
    return new Map(sucursales.map((s) => [s.id, s.nombre]));
  }, [sucursales]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (idOrigen === idDestino) {
        throw new Error("La sucursal de origen no puede ser igual a la de destino");
      }
      if (editingItem) {
        return rutasApi.actualizar(editingItem.id, {
          idSucursalOrigen: Number(idOrigen),
          idSucursalDestino: Number(idDestino),
          distanciaKm: Number(distanciaKm),
          tarifaBase: Number(tarifaBase),
        });
      }
      return rutasApi.crear({
        idSucursalOrigen: Number(idOrigen),
        idSucursalDestino: Number(idDestino),
        distanciaKm: Number(distanciaKm),
        tarifaBase: Number(tarifaBase),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rutas"] });
      toast.success(editingItem ? "Ruta actualizada" : "Ruta creada exitosamente");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al guardar ruta");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rutasApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rutas"] });
      toast.success("Ruta dada de baja lógica");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al eliminar ruta");
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    setIdOrigen(0);
    setIdDestino(0);
    setDistanciaKm(50);
    setTarifaBase(45);
    setIsModalOpen(true);
  };

  const openEdit = (r: Ruta) => {
    setEditingItem(r);
    setIdOrigen(r.idSucursalOrigen);
    setIdDestino(r.idSucursalDestino);
    setDistanciaKm(r.distanciaKm);
    setTarifaBase(r.tarifaBase);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(`¿Está seguro de dar de baja lógica a la ruta #${id}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Catálogo de Rutas de Distribución
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conexión entre agencias, kilometraje y tarifas base de flete.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} leftIcon={<PlusCircle className="w-4 h-4" />}>
          Nueva Ruta
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Cargando rutas...</div>
          ) : rutas.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No hay rutas registradas</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Trayecto (Origen → Destino)</th>
                  <th className="py-3 px-4">Distancia (km)</th>
                  <th className="py-3 px-4">Tarifa Base</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium font-mono">
                {rutas.map((r) => {
                  const orig = sucursalesMap.get(r.idSucursalOrigen) || `Agencia #${r.idSucursalOrigen}`;
                  const dest = sucursalesMap.get(r.idSucursalDestino) || `Agencia #${r.idSucursalDestino}`;

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-bold">#{r.id}</td>
                      <td className="py-3 px-4 text-slate-100 font-bold font-sans">
                        <span className="text-amber-400">{orig}</span>
                        <ArrowRight className="inline-block w-3.5 h-3.5 mx-2 text-slate-500" />
                        <span className="text-indigo-400">{dest}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{r.distanciaKm} km</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        {formatCurrency(r.tarifaBase)}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Editar Ruta" : "Nueva Ruta"}
        description="Establezca la conexión física entre dos sucursales activas."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Select
            label="Sucursal de Origen"
            value={idOrigen}
            onChange={(e) => setIdOrigen(Number(e.target.value))}
            required
          >
            <option value="0">-- Seleccione Origen --</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} (#{s.id})
              </option>
            ))}
          </Select>

          <Select
            label="Sucursal de Destino"
            value={idDestino}
            onChange={(e) => setIdDestino(Number(e.target.value))}
            required
          >
            <option value="0">-- Seleccione Destino --</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id} disabled={s.id === Number(idOrigen)}>
                {s.nombre} {s.id === Number(idOrigen) ? "(Misma sucursal)" : ""}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Distancia en Kilómetros (km)"
              type="number"
              step="0.1"
              min="0.1"
              value={distanciaKm}
              onChange={(e) => setDistanciaKm(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Tarifa Base de Ruta (Q)"
              type="number"
              step="0.1"
              min="0"
              value={tarifaBase}
              onChange={(e) => setTarifaBase(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={saveMutation.isPending}>
              {editingItem ? "Actualizar" : "Guardar Ruta"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
