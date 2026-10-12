import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tarifasApi } from "@/api/catalogos";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Edit2, Trash2, Tag, Search } from "lucide-react";
import { toast } from "sonner";
import type { Tarifa } from "@/types";

export function TarifasPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tarifa | null>(null);

  const [tipoCarga, setTipoCarga] = useState("");
  const [precioPorKg, setPrecioPorKg] = useState<number>(5);
  const [precioPorM3, setPrecioPorM3] = useState<number>(150);
  const [recargoEspecial, setRecargoEspecial] = useState<number>(0);

  const { data: tarifas = [], isLoading } = useQuery({
    queryKey: ["tarifas"],
    queryFn: () => tarifasApi.listar(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingItem) {
        return tarifasApi.actualizar(editingItem.id, {
          tipoCarga,
          precioPorKg: Number(precioPorKg),
          precioPorM3: Number(precioPorM3),
          recargoEspecial: Number(recargoEspecial),
        });
      }
      return tarifasApi.crear({
        tipoCarga,
        precioPorKg: Number(precioPorKg),
        precioPorM3: Number(precioPorM3),
        recargoEspecial: Number(recargoEspecial),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifas"] });
      toast.success(editingItem ? "Tarifa actualizada" : "Tarifa creada exitosamente");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al guardar tarifa");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tarifasApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifas"] });
      toast.success("Tarifa dada de baja lógica");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al eliminar tarifa");
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    setTipoCarga("");
    setPrecioPorKg(5);
    setPrecioPorM3(150);
    setRecargoEspecial(0);
    setIsModalOpen(true);
  };

  const openEdit = (t: Tarifa) => {
    setEditingItem(t);
    setTipoCarga(t.tipoCarga);
    setPrecioPorKg(t.precioPorKg);
    setPrecioPorM3(t.precioPorM3);
    setRecargoEspecial(t.recargoEspecial);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`¿Está seguro de dar de baja lógica a la tarifa "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">
            Catálogo de Tarifas y Tipos de Carga
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Precios por kilogramo, metro cúbico y recargos especiales de paquetería.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} leftIcon={<PlusCircle className="w-4 h-4" />}>
          Nueva Tarifa
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Cargando tarifas...</div>
          ) : tarifas.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No hay tarifas registradas</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Tipo de Carga</th>
                  <th className="py-3 px-4">Precio / kg</th>
                  <th className="py-3 px-4">Precio / m³</th>
                  <th className="py-3 px-4">Recargo Especial</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium font-mono">
                {tarifas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-bold">#{t.id}</td>
                    <td className="py-3 px-4 text-amber-400 font-bold font-sans">{t.tipoCarga}</td>
                    <td className="py-3 px-4 text-slate-200">{formatCurrency(t.precioPorKg)}</td>
                    <td className="py-3 px-4 text-slate-200">{formatCurrency(t.precioPorM3)}</td>
                    <td className="py-3 px-4 text-slate-300">{formatCurrency(t.recargoEspecial)}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.tipoCarga)}
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
        title={editingItem ? "Editar Tarifa" : "Nueva Tarifa"}
        description="Parámetros de tarificación de acuerdo al tipo de carga."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Tipo de Carga / Categoría"
            value={tipoCarga}
            onChange={(e) => setTipoCarga(e.target.value)}
            placeholder="Ej: Estándar, Perecedero, Frágil, Urgente"
            maxLength={31}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Precio / kg (Q)"
              type="number"
              step="0.01"
              min="0"
              value={precioPorKg}
              onChange={(e) => setPrecioPorKg(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Precio / m³ (Q)"
              type="number"
              step="0.01"
              min="0"
              value={precioPorM3}
              onChange={(e) => setPrecioPorM3(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Recargo Especial (Q)"
              type="number"
              step="0.01"
              min="0"
              value={recargoEspecial}
              onChange={(e) => setRecargoEspecial(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={saveMutation.isPending}>
              {editingItem ? "Actualizar" : "Guardar Tarifa"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
