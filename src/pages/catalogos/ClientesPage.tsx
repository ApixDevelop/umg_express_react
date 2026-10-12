import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientesApi } from "@/api/catalogos";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PlusCircle, Edit2, Trash2, Users, Search } from "lucide-react";
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
      toast.success(editingItem ? "Cliente actualizado" : "Cliente creado exitosamente");
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
      toast.success("Cliente dado de baja lógica exitosamente");
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
    if (window.confirm(`¿Está seguro de dar de baja lógica al cliente "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Catálogo de Clientes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestión de remitentes y destinatarios para emisión de guías de carga.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} leftIcon={<PlusCircle className="w-4 h-4" />}>
          Nuevo Cliente
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por NIT, nombre o teléfono..."
            className="w-full bg-slate-950/80 text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-800 pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Cargando clientes...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No se encontraron clientes registrados</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">NIT</th>
                  <th className="py-3 px-4">Nombre / Razón Social</th>
                  <th className="py-3 px-4">Dirección</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{c.id}</td>
                    <td className="py-3 px-4 font-mono text-amber-400 font-semibold">{c.nit}</td>
                    <td className="py-3 px-4 text-slate-100 font-bold">{c.nombre}</td>
                    <td className="py-3 px-4 text-slate-300">{c.direccion}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.telefono}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.nombre)}
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
        title={editingItem ? "Editar Cliente" : "Nuevo Cliente"}
        description="Datos del cliente individual o corporativo."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="NIT del Cliente"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            placeholder="Ej: 1234567-8 o C/F"
            maxLength={19}
            required
          />
          <Input
            label="Nombre Completo o Empresa"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Distribuidora El Sol, S.A."
            maxLength={63}
            required
          />
          <Input
            label="Dirección de Facturación / Entrega"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej: Calzada Roosevelt 12-45, Zona 11"
            maxLength={127}
            required
          />
          <Input
            label="Teléfono de Contacto"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 2440-5555"
            maxLength={19}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={saveMutation.isPending}>
              {editingItem ? "Actualizar" : "Guardar Cliente"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
