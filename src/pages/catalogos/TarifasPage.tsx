import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tarifasApi } from "@/api/catalogos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { Edit2, Trash2, Plus, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
      toast.success(editingItem ? "Tarifa actualizada" : "Tarifa registrada");
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
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-semibold text-text tracking-tight">Tarifario de Carga</h1>
          <Badge variant="default">{tarifas.length} modalidades</Badge>
        </div>
        <p className="text-[12px] text-text-muted mt-0.5">
          Parámetros de facturación por peso báscula (kg) y volumen cúbico (m³).
        </p>
        <Button variant="primary" size="sm" onClick={openCreate} className="gap-1.5 active:scale-[0.97]">
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva tarifa</span>
        </Button>
      </div>

      {/* Listado denso */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center text-text-muted text-[13px]">Cargando tarifas...</div>
          ) : tarifas.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-text-muted">No se encontraron tarifas registradas.</div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-[12px] font-medium">
                  <th className="py-2 px-3 font-medium">ID</th>
                  <th className="py-2 px-3 font-medium">Tipo de carga</th>
                  <th className="py-2 px-3 text-right font-medium">Precio / kg</th>
                  <th className="py-2 px-3 text-right font-medium">Precio / m³</th>
                  <th className="py-2 px-3 text-right font-medium">Recargo especial</th>
                  <th className="py-2 px-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tarifas.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-hover transition-colors h-10">
                    <td className="py-2 px-3 text-text-muted tabular-nums">#{t.id}</td>
                    <td className="py-2 px-3 text-text font-medium">{t.tipoCarga}</td>
                    <td className="py-2 px-3 text-right text-text tabular-nums">
                      {formatCurrency(t.precioPorKg)}
                    </td>
                    <td className="py-2 px-3 text-right text-text tabular-nums">
                      {formatCurrency(t.precioPorM3)}
                    </td>
                    <td className="py-2 px-3 text-right text-text tabular-nums">
                      {formatCurrency(t.recargoEspecial)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors cursor-pointer active:scale-[0.92]"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.tipoCarga)}
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
        title={editingItem ? "Editar tarifa" : "Nueva tarifa"}
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

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saveMutation.isPending}>
              Guardar tarifa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}