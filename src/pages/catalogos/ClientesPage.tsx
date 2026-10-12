import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientesApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Cliente } from "@/types";

export function ClientesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cliente | null>(null);

  const [nit, setNit] = useState("");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => clientesApi.listar(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingItem) {
        return clientesApi.actualizar(editingItem.id, { nit, nombre, direccion, telefono });
      }
      return clientesApi.crear({ nit, nombre, direccion, telefono });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success(editingItem ? "Cliente actualizado" : "Cliente registrado");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al guardar cliente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientesApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente dado de baja");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al eliminar cliente");
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    setNit("");
    setNombre("");
    setDireccion("");
    setTelefono("");
    setIsModalOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setEditingItem(c);
    setNit(c.nit);
    setNombre(c.nombre);
    setDireccion(c.direccion);
    setTelefono(c.telefono);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`¿Está seguro de dar de baja al cliente "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-text">Clientes</h1>
        <Button variant="primary" size="sm" onClick={openCreate}>
          Nuevo cliente
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
            placeholder="Buscar por NIT, nombre o teléfono"
            className="w-full h-8 bg-surface text-text text-[13px] rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Listado denso */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center text-text-muted text-[13px]">Cargando clientes...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-text-muted">No se encontraron clientes registrados.</div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">ID</th>
                  <th className="py-2 px-3 font-medium">NIT</th>
                  <th className="py-2 px-3 font-medium">Nombre</th>
                  <th className="py-2 px-3 font-medium">Dirección</th>
                  <th className="py-2 px-3 font-medium">Teléfono</th>
                  <th className="py-2 px-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text-muted tabular-nums">#{c.id}</td>
                    <td className="py-2 px-3 text-text tabular-nums">{c.nit}</td>
                    <td className="py-2 px-3 text-text font-medium">{c.nombre}</td>
                    <td className="py-2 px-3 text-text-muted truncate max-w-[200px]">{c.direccion}</td>
                    <td className="py-2 px-3 text-text-muted tabular-nums">{c.telefono}</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.nombre)}
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
        title={editingItem ? "Editar cliente" : "Nuevo cliente"}
        description="Datos del cliente individual o corporativo."
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
              label="NIT del cliente"
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              placeholder="Ej: 1234567-8 o C/F"
              maxLength={19}
              required
            />
            <Input
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 2234-5678"
              maxLength={19}
              required
            />
          </div>
          <Input
            label="Nombre completo o razón social"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Distribuidora Central, S.A."
            maxLength={63}
            required
          />
          <Input
            label="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej: 5ta Avenida 12-45 Zona 1, Guatemala"
            maxLength={99}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Guardar cliente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}