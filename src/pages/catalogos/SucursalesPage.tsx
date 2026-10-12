import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sucursalesApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Sucursal } from "@/types";

export function SucursalesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sucursal | null>(null);

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  const { data: sucursales = [], isLoading } = useQuery({
    queryKey: ["sucursales"],
    queryFn: () => sucursalesApi.listar(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingItem) {
        return sucursalesApi.actualizar(editingItem.id, { nombre, direccion, telefono });
      }
      return sucursalesApi.crear({ nombre, direccion, telefono });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sucursales"] });
      toast.success(editingItem ? "Sucursal actualizada" : "Sucursal registrada exitosamente");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al guardar sucursal");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => sucursalesApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sucursales"] });
      toast.success("Sucursal dada de baja");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al eliminar sucursal");
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    setNombre("");
    setDireccion("");
    setTelefono("");
    setIsModalOpen(true);
  };

  const openEdit = (s: Sucursal) => {
    setEditingItem(s);
    setNombre(s.nombre);
    setDireccion(s.direccion);
    setTelefono(s.telefono);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`¿Está seguro de dar de baja la sucursal "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = sucursales.filter((s) =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.telefono.includes(searchTerm)
  );

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Sucursales</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Agencias de recepción, bodegas y puntos de despacho
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Nueva sucursal
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
            placeholder="Buscar por nombre, dirección o teléfono..."
            className="w-full bg-slate-900 text-slate-100 text-xs rounded-lg border border-slate-750 pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Listado denso */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Cargando sucursales...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No se encontraron sucursales registradas.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3">Dirección</th>
                  <th className="py-2.5 px-3">Teléfono</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-400">#{s.id}</td>
                    <td className="py-2 px-3 text-slate-100 font-medium">{s.nombre}</td>
                    <td className="py-2 px-3 text-slate-300 truncate max-w-[250px]">{s.direccion}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{s.telefono}</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.nombre)}
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
        title={editingItem ? "Editar Sucursal" : "Nueva Sucursal"}
        description="Identificación y ubicación de la agencia de recepción."
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
              label="Nombre de la sucursal"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Agencia Central Zona 1"
              maxLength={49}
              required
            />
            <Input
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 2200-1100"
              maxLength={19}
              required
            />
          </div>
          <Input
            label="Dirección completa"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej: 7a Avenida 8-32 Zona 1, Ciudad de Guatemala"
            maxLength={99}
            required
          />

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
