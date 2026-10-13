import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pilotosApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Edit2, Trash2, Search, Plus, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
      toast.success(editingItem ? "Piloto actualizado" : "Piloto registrado");
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
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-semibold text-text tracking-tight">Plantilla de Pilotos</h1>
          <Badge variant="default">{pilotos.length} activos</Badge>
        </div>
        <p className="text-[12px] text-text-muted mt-0.5">
          Conductores certificados con licencia profesional para transporte de carga.
        </p>
        <Button variant="primary" size="sm" onClick={openCreate} className="gap-1.5 active:scale-[0.97]">
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo piloto</span>
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
            placeholder="Buscar por nombre, licencia o teléfono"
            className="w-full h-8 bg-surface text-text text-[13px] rounded-control border border-border-input pl-8 pr-2.5 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Listado denso */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center text-text-muted text-[13px]">Cargando pilotos...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-text-muted">No se encontraron pilotos registrados.</div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">ID</th>
                  <th className="py-2 px-3 font-medium">Nombre</th>
                  <th className="py-2 px-3 font-medium">Licencia</th>
                  <th className="py-2 px-3 font-medium">Teléfono</th>
                  <th className="py-2 px-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text-muted tabular-nums">#{p.id}</td>
                    <td className="py-2 px-3 text-text font-medium">{p.nombre}</td>
                    <td className="py-2 px-3 text-text-muted">{p.licencia}</td>
                    <td className="py-2 px-3 text-text-muted tabular-nums">{p.telefono}</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors cursor-pointer active:scale-[0.92]"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.nombre)}
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
        title={editingItem ? "Editar piloto" : "Nuevo piloto"}
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

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Guardar piloto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}