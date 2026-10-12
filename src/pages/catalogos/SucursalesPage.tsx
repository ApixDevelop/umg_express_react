import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sucursalesApi } from "@/api/catalogos";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PlusCircle, Edit2, Trash2, Building2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Sucursal } from "@/types";

export function SucursalesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sucursal | null>(null);

  // Form fields
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
      toast.success(editingItem ? "Sucursal actualizada" : "Sucursal creada exitosamente");
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
      toast.success("Sucursal dada de baja lógica exitosamente");
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
    if (window.confirm(`¿Está seguro de dar de baja lógica la sucursal "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = sucursales.filter((s) =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.telefono.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Catálogo de Sucursales y Agencias
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Administración de puntos de recepción, bodegas y centros de distribución interdepartamentales.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} leftIcon={<PlusCircle className="w-4 h-4" />}>
          Nueva Sucursal
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, dirección o teléfono..."
            className="w-full bg-slate-950/80 text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-800 pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Cargando sucursales...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No se encontraron sucursales registradas</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nombre de la Agencia</th>
                  <th className="py-3 px-4">Dirección / Ubicación</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{s.id}</td>
                    <td className="py-3 px-4 text-slate-100 font-bold">{s.nombre}</td>
                    <td className="py-3 px-4 text-slate-300">{s.direccion}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{s.telefono}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.nombre)}
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
        title={editingItem ? "Editar Sucursal" : "Nueva Sucursal"}
        description="Complete la información oficial de la sucursal o agencia."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Nombre de la Agencia"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Sucursal Central Guatemala"
            maxLength={63}
            required
          />
          <Input
            label="Dirección Completa"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej: Zona 10, Ciudad de Guatemala"
            maxLength={127}
            required
          />
          <Input
            label="Teléfono de Contacto"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 2222-0001"
            maxLength={19}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={saveMutation.isPending}>
              {editingItem ? "Actualizar" : "Guardar Sucursal"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
