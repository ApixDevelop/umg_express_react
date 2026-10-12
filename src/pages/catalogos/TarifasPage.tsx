import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tarifasApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Trash2 } from "lucide-react";
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
      toast.success(editingItem ? "Tarifa actualizada" : "Tarifa registrada exitosamente");
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
      toast.success("Tarifa dada de baja");
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
    if (window.confirm(`¿Está seguro de dar de baja la tarifa "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Tarifas y Tipos de Carga</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Precios por kilogramo, metro cúbico y recargos especiales por mercancía
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Nueva tarifa
        </Button>
      </div>

      {/* Listado denso */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1425] overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Cargando tarifas...</div>
          ) : tarifas.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No se encontraron tarifas registradas.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-[11px] font-medium">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Tipo de carga</th>
                  <th className="py-2.5 px-3 text-right">Precio / kg</th>
                  <th className="py-2.5 px-3 text-right">Precio / m³</th>
                  <th className="py-2.5 px-3 text-right">Recargo especial</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tarifas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-400">#{t.id}</td>
                    <td className="py-2 px-3 text-slate-100 font-medium">{t.tipoCarga}</td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">
                      {formatCurrency(t.precioPorKg)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">
                      {formatCurrency(t.precioPorM3)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">
                      {formatCurrency(t.recargoEspecial)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.tipoCarga)}
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
        title={editingItem ? "Editar Tarifa" : "Nueva Tarifa"}
        description="Parámetros de tarificación según la naturaleza de la carga."
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
            label="Tipo de carga o categoría"
            value={tipoCarga}
            onChange={(e) => setTipoCarga(e.target.value)}
            placeholder="Ej: Frágil / Perecedero / Sobredimensionado"
            maxLength={39}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Precio por kg (Q)"
              type="number"
              step="0.01"
              min="0"
              value={precioPorKg}
              onChange={(e) => setPrecioPorKg(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Precio por m³ (Q)"
              type="number"
              step="0.01"
              min="0"
              value={precioPorM3}
              onChange={(e) => setPrecioPorM3(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Recargo fijo (Q)"
              type="number"
              step="0.01"
              min="0"
              value={recargoEspecial}
              onChange={(e) => setRecargoEspecial(parseFloat(e.target.value) || 0)}
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
