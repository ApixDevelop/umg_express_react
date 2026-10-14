import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiculosApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Edit2, Trash2, Search, Plus, Truck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import type { Vehiculo, EstadoVehiculo } from "@/types";

export function VehiculosPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehiculo | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: number; name: string } | null>(null);

  const [placa, setPlaca] = useState("");
  const [marcaModelo, setMarcaModelo] = useState("");
  const [capacidadPesoKg, setCapacidadPesoKg] = useState<number | string>(1000);
  const [capacidadVolumenM3, setCapacidadVolumenM3] = useState<number | string>(10);
  const [estado, setEstado] = useState<EstadoVehiculo>("Disponible");

  const { data: vehiculos = [], isLoading } = useQuery({
    queryKey: ["vehiculos"],
    queryFn: () => vehiculosApi.listar(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingItem) {
        return vehiculosApi.actualizar(editingItem.id, {
          placa,
          marcaModelo,
          capacidadPesoKg: Number(capacidadPesoKg),
          capacidadVolumenM3: Number(capacidadVolumenM3),
          estado,
        });
      }
      return vehiculosApi.crear({
        placa,
        marcaModelo,
        capacidadPesoKg: Number(capacidadPesoKg),
        capacidadVolumenM3: Number(capacidadVolumenM3),
        estado,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      toast.success(editingItem ? "Vehículo actualizado" : "Vehículo registrado");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al guardar vehículo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiculosApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      toast.success("Vehículo dado de baja");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al eliminar vehículo");
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    setPlaca("");
    setMarcaModelo("");
    setCapacidadPesoKg(1000);
    setCapacidadVolumenM3(10);
    setEstado("Disponible");
    setIsModalOpen(true);
  };

  const openEdit = (v: Vehiculo) => {
    setEditingItem(v);
    setPlaca(v.placa);
    setMarcaModelo(v.marcaModelo);
    setCapacidadPesoKg(v.capacidadPesoKg);
    setCapacidadVolumenM3(v.capacidadVolumenM3);
    setEstado(v.estado);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number, placa: string) => {
    setDeletingItem({ id, name: placa });
  };

  const filtered = vehiculos.filter((v) =>
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marcaModelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-semibold text-text tracking-tight">Flota Vehicular</h1>
          <Badge variant="default">{vehiculos.length} unidades</Badge>
        </div>
        <p className="text-[12px] text-text-muted mt-0.5">
          Parque vehicular pesado, capacidad de estiba y estado operativo en patio.
        </p>
        <Button variant="primary" size="sm" onClick={openCreate} className="gap-1.5 active:scale-[0.97]">
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo vehículo</span>
        </Button>
      </div>

      {/* Barra de herramientas */}
      <div className="rounded-panel border border-border bg-surface p-3">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa o modelo"
            className="w-full h-8 bg-surface text-text text-[13px] rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Listado denso */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center text-text-muted text-[13px]">Cargando flota...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-text-muted">No se encontraron vehículos registrados.</div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">ID</th>
                  <th className="py-2 px-3 font-medium">Placa</th>
                  <th className="py-2 px-3 font-medium">Marca y modelo</th>
                  <th className="py-2 px-3 text-right font-medium">Capacidad peso (kg)</th>
                  <th className="py-2 px-3 text-right font-medium">Capacidad volumen (m³)</th>
                  <th className="py-2 px-3 font-medium">Estado</th>
                  <th className="py-2 px-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text-muted tabular-nums">#{v.id}</td>
                    <td className="py-2 px-3 text-text font-medium">{v.placa}</td>
                    <td className="py-2 px-3 text-text-muted">{v.marcaModelo}</td>
                    <td className="py-2 px-3 text-right text-text tabular-nums">{v.capacidadPesoKg}</td>
                    <td className="py-2 px-3 text-right text-text-muted tabular-nums">{v.capacidadVolumenM3}</td>
                    <td className="py-2 px-3">
                      <StatusBadge status={v.estado} />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors cursor-pointer active:scale-[0.92]"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.placa)}
                          className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors cursor-pointer active:scale-[0.92]"
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
        title={editingItem ? "Editar vehículo" : "Nuevo vehículo"}
        description="Ficha técnica de unidad de transporte."
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
            <Input
              label="Número de placa"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Ej: C-123XYZ"
              maxLength={15}
              required
            />
            <Input
              label="Marca y modelo"
              value={marcaModelo}
              onChange={(e) => setMarcaModelo(e.target.value)}
              placeholder="Ej: Hino Serie 300"
              maxLength={49}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Capacidad peso (kg)"
              type="number"
              step="1"
              min="1"
              placeholder="Ej: 1000"
              value={capacidadPesoKg}
              onChange={(e) => setCapacidadPesoKg(e.target.value)}
              required
            />
            <Input
              label="Capacidad volumen (m³)"
              type="number"
              step="1"
              min="1"
              placeholder="Ej: 10"
              value={capacidadVolumenM3}
              onChange={(e) => setCapacidadVolumenM3(e.target.value)}
              required
            />
            <Select
              label="Estado operativo"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoVehiculo)}
            >
              <option value="Disponible">Disponible</option>
              <option value="En ruta">En ruta</option>
              <option value="En taller">En taller</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Guardar vehículo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialogo personalizado de confirmacion para baja logica */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) {
            deleteMutation.mutate(deletingItem.id, {
              onSettled: () => setDeletingItem(null),
            });
          }
        }}
        title="Dar de baja vehículo"
        message={
          <span>
            ¿Está seguro de dar de baja el vehículo con placa <strong>"{deletingItem?.name}"</strong>?
          </span>
        }
        description="Esta unidad dejará de figurar en la bahía de despacho operativo."
        confirmText="Dar de baja"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}