import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiculosApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Vehiculo, EstadoVehiculo } from "@/types";

export function VehiculosPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehiculo | null>(null);

  const [placa, setPlaca] = useState("");
  const [marcaModelo, setMarcaModelo] = useState("");
  const [capacidadPesoKg, setCapacidadPesoKg] = useState<number>(1000);
  const [capacidadVolumenM3, setCapacidadVolumenM3] = useState<number>(10);
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
      toast.success(editingItem ? "Vehículo actualizado" : "Vehículo registrado exitosamente");
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
    if (window.confirm(`¿Está seguro de dar de baja el vehículo "${placa}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = vehiculos.filter((v) =>
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marcaModelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Flota Vehicular</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro y control de capacidad física de unidades de transporte
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Nuevo vehículo
        </Button>
      </div>

      {/* Barra de herramientas */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa o modelo..."
            className="w-full bg-slate-900 text-slate-100 text-xs rounded-lg border border-slate-750 pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Listado denso */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Cargando flota...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No se encontraron vehículos registrados.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Placa</th>
                  <th className="py-2.5 px-3">Marca y modelo</th>
                  <th className="py-2.5 px-3 text-right">Cap. peso</th>
                  <th className="py-2.5 px-3 text-right">Cap. volumen</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-400">#{v.id}</td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-200">{v.placa}</td>
                    <td className="py-2 px-3 text-slate-300">{v.marcaModelo}</td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{v.capacidadPesoKg} kg</td>
                    <td className="py-2 px-3 text-right text-slate-400 tabular-nums">{v.capacidadVolumenM3} m³</td>
                    <td className="py-2 px-3">
                      <StatusBadge status={v.estado} />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.placa)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
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
        title={editingItem ? "Editar Vehículo" : "Nuevo Vehículo"}
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
              placeholder="Ej: Hino Serie 300 (4 Ton)"
              maxLength={49}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Capacidad peso (kg)"
              type="number"
              step="0.01"
              min="1"
              value={capacidadPesoKg}
              onChange={(e) => setCapacidadPesoKg(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Capacidad volumen (m³)"
              type="number"
              step="0.01"
              min="0.1"
              value={capacidadVolumenM3}
              onChange={(e) => setCapacidadVolumenM3(parseFloat(e.target.value) || 0)}
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
