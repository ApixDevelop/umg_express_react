import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pilotosApi } from "@/api/catalogos";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PlusCircle, Edit2, Trash2, UserCheck, Search } from "lucide-react";
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
      toast.success("Piloto dado de baja lógica");
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

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`¿Está seguro de dar de baja lógica al piloto "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = pilotos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telefono.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Catálogo de Pilotos y Conductores
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal operativo habilitado para asignación y transporte de carga.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} leftIcon={<PlusCircle className="w-4 h-4" />}>
          Nuevo Piloto
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, licencia o teléfono..."
            className="w-full bg-slate-950/80 text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-800 pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Cargando pilotos...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No hay pilotos registrados</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nombre Completo</th>
                  <th className="py-3 px-4">No. de Licencia</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{p.id}</td>
                    <td className="py-3 px-4 text-slate-100 font-bold">{p.nombre}</td>
                    <td className="py-3 px-4 font-mono text-amber-400 font-semibold">{p.licencia}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{p.telefono}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.nombre)}
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
        title={editingItem ? "Editar Piloto" : "Nuevo Piloto"}
        description="Datos personales y licencia de conducir del transportista."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Nombre Completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Mario Estrada Pérez"
            maxLength={63}
            required
          />
          <Input
            label="Número de Licencia de Conducir"
            value={licencia}
            onChange={(e) => setLicencia(e.target.value)}
            placeholder="Ej: LIC-12345"
            maxLength={19}
            required
          />
          <Input
            label="Teléfono de Contacto"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 5555-1111"
            maxLength={19}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={saveMutation.isPending}>
              {editingItem ? "Actualizar" : "Guardar Piloto"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
