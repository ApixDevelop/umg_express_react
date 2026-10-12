import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiculosApi } from "@/api/catalogos";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PlusCircle, Edit2, Trash2, Truck, Search } from "lucide-react";
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
      toast.success("Vehículo dado de baja lógica");
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

  const handleDelete = (id: number, placaStr: string) => {
    if (window.confirm(`¿Está seguro de dar de baja lógica al vehículo con placa "${placaStr}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = vehiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marcaModelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Flota Vehicular y Transporte
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Control de unidades físicas de transporte, capacidad volumétrica y operativa.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} leftIcon={<PlusCircle className="w-4 h-4" />}>
          Nuevo Vehículo
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa o marca/modelo..."
            className="w-full bg-slate-950/80 text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-800 pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Cargando flota...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No hay vehículos registrados</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Placa Oficial</th>
                  <th className="py-3 px-4">Marca / Modelo</th>
                  <th className="py-3 px-4">Capacidad Peso (kg)</th>
                  <th className="py-3 px-4">Capacidad Vol. (m³)</th>
                  <th className="py-3 px-4">Estado Operativo</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-bold">#{v.id}</td>
                    <td className="py-3 px-4 font-bold text-amber-400">{v.placa}</td>
                    <td className="py-3 px-4 text-slate-200 font-sans">{v.marcaModelo}</td>
                    <td className="py-3 px-4 text-slate-100">{v.capacidadPesoKg} kg</td>
                    <td className="py-3 px-4 text-slate-100">{v.capacidadVolumenM3} m³</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.estado} />
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.placa)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Editar Vehículo" : "Nuevo Vehículo"}
        description="Ficha técnica de unidad de transporte."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Número de Placa"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            placeholder="Ej: C-123XYZ o P-100AAA"
            maxLength={14}
            required
          />
          <Input
            label="Marca y Modelo"
            value={marcaModelo}
            onChange={(e) => setMarcaModelo(e.target.value)}
            placeholder="Ej: Isuzu NPR 2024"
            maxLength={49}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacidad Peso (kg)"
              type="number"
              step="0.1"
              min="1"
              value={capacidadPesoKg}
              onChange={(e) => setCapacidadPesoKg(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Capacidad Volumen (m³)"
              type="number"
              step="0.1"
              min="0.1"
              value={capacidadVolumenM3}
              onChange={(e) => setCapacidadVolumenM3(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <Select
            label="Estado Operativo"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoVehiculo)}
            required
          >
            <option value="Disponible">Disponible (Listo para despacho)</option>
            <option value="En ruta">En ruta (Con carga asignada)</option>
            <option value="En taller">En taller (Inactivo por mantenimiento)</option>
          </Select>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={saveMutation.isPending}>
              {editingItem ? "Actualizar" : "Guardar Vehículo"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
