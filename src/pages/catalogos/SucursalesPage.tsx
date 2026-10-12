import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sucursalesApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Edit2, Trash2, Search } from "lucide-react";
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
      toast.success(editingItem ? "Sucursal actualizada" : "Sucursal registrada");
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
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text">Sucursales</h1>
        <Button variant="primary" size="sm" onClick={openCreate}>
          Nueva sucursal
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
            placeholder="Buscar por nombre, dirección o teléfono"
            className="w-full h-8 bg-surface text-text text-[13px] rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Listado denso */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center text-text-muted text-[13px]">Cargando sucursales...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-text-muted">No se encontraron sucursales registradas.</div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">ID</th>
                  <th className="py-2 px-3 font-medium">Nombre</th>
                  <th className="py-2 px-3 font-medium">Dirección</th>
                  <th className="py-2 px-3 font-medium">Teléfono</th>
                  <th className="py-2 px-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text-muted tabular-nums">#{s.id}</td>
                    <td className="py-2 px-3 text-text font-medium">{s.nombre}</td>
                    <td className="py-2 px-3 text-text-muted truncate max-w-[250px]">{s.direccion}</td>
                    <td className="py-2 px-3 text-text-muted tabular-nums">{s.telefono}</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.nombre)}
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
        title={editingItem ? "Editar sucursal" : "Nueva sucursal"}
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

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Guardar sucursal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}