import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rutasApi, sucursalesApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";
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
      toast.success(editingItem ? "Ruta actualizada" : "Ruta registrada");
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
      toast.success("Ruta dada de baja");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al eliminar ruta");
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    setIdOrigen(sucursales[0]?.id || 0);
    setIdDestino(sucursales[1]?.id || 0);
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
    if (window.confirm(`¿Está seguro de dar de baja la ruta #${id}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text">Rutas de distribución</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (sucursales.length < 2) {
              toast.error("Debe registrar al menos 2 sucursales para crear una ruta");
              return;
            }
            openCreate();
          }}
        >
          Nueva ruta
        </Button>
      </div>

      {/* Listado denso */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center text-text-muted text-[13px]">Cargando rutas...</div>
          ) : rutas.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-text-muted">No se encontraron rutas registradas.</div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">ID</th>
                  <th className="py-2 px-3 font-medium">Origen</th>
                  <th className="py-2 px-3 font-medium">Destino</th>
                  <th className="py-2 px-3 text-right font-medium">Distancia (km)</th>
                  <th className="py-2 px-3 text-right font-medium">Tarifa base</th>
                  <th className="py-2 px-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rutas.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text-muted tabular-nums">#{r.id}</td>
                    <td className="py-2 px-3 text-text">
                      {sucursalesMap.get(r.idSucursalOrigen) || `Sucursal #${r.idSucursalOrigen}`}
                    </td>
                    <td className="py-2 px-3 text-text">
                      {sucursalesMap.get(r.idSucursalDestino) || `Sucursal #${r.idSucursalDestino}`}
                    </td>
                    <td className="py-2 px-3 text-right text-text tabular-nums">{r.distanciaKm}</td>
                    <td className="py-2 px-3 text-right text-text font-medium tabular-nums">
                      {formatCurrency(r.tarifaBase)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Formulario modal hasta 720px */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Editar ruta" : "Nueva ruta"}
        description="Configure la relación de agencias origen y destino."
        maxWidth="720"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Sucursal de origen"
              value={idOrigen}
              onChange={(e) => setIdOrigen(Number(e.target.value))}
              required
            >
              <option value="0">-- Seleccione origen --</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </Select>

            <Select
              label="Sucursal de destino"
              value={idDestino}
              onChange={(e) => setIdDestino(Number(e.target.value))}
              required
            >
              <option value="0">-- Seleccione destino --</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === Number(idOrigen)}>
                  {s.nombre} {s.id === Number(idOrigen) ? "(Misma sucursal)" : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Distancia aproximada (km)"
              type="number"
              step="0.1"
              min="1"
              value={distanciaKm}
              onChange={(e) => setDistanciaKm(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Tarifa base de flete (Q)"
              type="number"
              step="0.01"
              min="0"
              value={tarifaBase}
              onChange={(e) => setTarifaBase(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Guardar ruta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}