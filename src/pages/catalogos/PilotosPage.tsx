import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pilotosApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Piloto } from "@/types";

export function PilotosPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Piloto | null>(null);

  const [nombre, setNombre] = useState("");
  const [licencia, setLicencia] = useState("");
  const [telefono, setTelefono] = useState("");

  const { data: pilotos = [], isLoading } = useQuery({
    queryKey: ["pilotos"],
    queryFn: () => pilotosApi.listar(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingItem) {
        return pilotosApi.actualizar(editingItem.id, { nombre, licencia, telefono });
      }
      return pilotosApi.crear({ nombre, licencia, telefono });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilotos"] });
      toast.success(editingItem ? "Piloto actualizado" : "Piloto registrado exitosamente");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al guardar piloto");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pilotosApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilotos"] });
      toast.success("Piloto dado de baja");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al eliminar piloto");
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    setNombre("");
    setLicencia("");
    setTelefono("");
    setIsModalOpen(true);
  };

  const openEdit = (p: Piloto) => {
    setEditingItem(p);
    setNombre(p.nombre);
    setLicencia(p.licencia);
    setTelefono(p.telefono);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number, nombre: string) => {
    if (window.confirm(`¿Está seguro de dar de baja al piloto "${nombre}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = pilotos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.licencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefono.includes(searchTerm)
  );

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Pilotos</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Conductores autorizados para transporte y entrega de carga
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Nuevo piloto
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
            placeholder="Buscar por nombre, licencia o teléfono..."
            className="w-full bg-slate-900 text-slate-100 text-xs rounded-lg border border-slate-750 pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Listado denso */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Cargando pilotos...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No se encontraron pilotos registrados.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3">Licencia</th>
                  <th className="py-2.5 px-3">Teléfono</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-400">#{p.id}</td>
                    <td className="py-2 px-3 text-slate-100 font-medium">{p.nombre}</td>
                    <td className="py-2 px-3 font-mono text-slate-200">{p.licencia}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{p.telefono}</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.nombre)}
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
        title={editingItem ? "Editar Piloto" : "Nuevo Piloto"}
        description="Ficha del conductor asignado a vehículos de carga."
        maxWidth="720"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-3"
        >
          <Input
            label="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Carlos Gómez"
            maxLength={63}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Número de licencia"
              value={licencia}
              onChange={(e) => setLicencia(e.target.value)}
              placeholder="Ej: LIC-A-987654"
              maxLength={29}
              required
            />
            <Input
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 5544-3322"
              maxLength={19}
              required
            />
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
