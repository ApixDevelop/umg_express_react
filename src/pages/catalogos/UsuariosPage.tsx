import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, CrearUsuarioPayload, ActualizarUsuarioPayload } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  Edit2,
  Trash2,
  Search,
  Plus,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";
import type { Usuario, UserRole } from "@/types";

export function UsuariosPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Usuario | null>(null);
  const [deletingItem, setDeletingItem] = useState<Usuario | null>(null);

  // Form State
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<UserRole>("Operador");

  // Query: Listar usuarios del backend
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => authApi.listarUsuarios(),
  });

  // Mutación: Guardar (Crear / Actualizar)
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingItem) {
        const payload: ActualizarUsuarioPayload = {
          nombre,
          username,
          rol,
          ...(password.trim() ? { password: password.trim() } : {}),
        };
        return authApi.actualizarUsuario(editingItem.id, payload);
      } else {
        const payload: CrearUsuarioPayload = {
          nombre,
          username,
          password: password.trim(),
          rol,
        };
        return authApi.crearUsuario(payload);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success(
        editingItem
          ? `Usuario "${data.username}" actualizado exitosamente`
          : `Usuario "${data.username}" registrado exitosamente`
      );
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.mensaje || err.message || "Error al procesar usuario");
    },
  });

  // Mutación: Eliminar (Baja lógica)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => authApi.eliminarUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario dado de baja exitosamente");
      setDeletingItem(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.mensaje || err.message || "Error al dar de baja al usuario");
      setDeletingItem(null);
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    setNombre("");
    setUsername("");
    setPassword("");
    setRol("Operador");
    setIsModalOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setEditingItem(u);
    setNombre(u.nombre);
    setUsername(u.username);
    setPassword(""); // Se deja vacío para no alterar la contraseña existente a menos que se escriba una nueva
    setRol(u.rol);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !username.trim()) {
      toast.error("El nombre completo y nombre de usuario son obligatorios");
      return;
    }
    if (!editingItem && !password.trim()) {
      toast.error("La contraseña inicial es obligatoria para nuevos usuarios");
      return;
    }
    saveMutation.mutate();
  };

  // Contadores para filtros
  const counts = useMemo(() => {
    return {
      todos: usuarios.length,
      admin: usuarios.filter((u) => u.rol === "Administrador").length,
      operador: usuarios.filter((u) => u.rol === "Operador").length,
      auditor: usuarios.filter((u) => u.rol === "Auditor").length,
    };
  }, [usuarios]);

  // Lista filtrada
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const matchRole = filterRole === "TODOS" || u.rol === filterRole;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchRole;
      return (
        matchRole &&
        (u.nombre.toLowerCase().includes(term) ||
          u.username.toLowerCase().includes(term) ||
          u.rol.toLowerCase().includes(term))
      );
    });
  }, [usuarios, filterRole, searchTerm]);

  // Color de insignia según rol
  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case "Administrador":
        return <Badge variant="default">Administrador</Badge>;
      case "Auditor":
        return <Badge variant="warning">Auditor</Badge>;
      case "Operador":
      default:
        return <Badge variant="info">Operador</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera y botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-text tracking-tight">
              Control de Accesos y Usuarios
            </h1>
            <Badge variant="default">Seguridad RBAC</Badge>
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">
            Gestión de credenciales internas, roles de privilegio del sistema y auditoría de accesos.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={openCreate}
          className="gap-1.5 shadow-sm active:scale-[0.97]"
        >
          <span>Nuevo usuario</span>
        </Button>
      </div>

      {/* Barra de Búsqueda y Píldoras de Filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterRole("TODOS")}
            className={`px-2.5 py-1 text-[11px] rounded-full border transition-all cursor-pointer font-medium ${
              filterRole === "TODOS"
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-surface text-text-muted border-border hover:bg-surface-hover"
            }`}
          >
            Todos ({counts.todos})
          </button>
          <button
            onClick={() => setFilterRole("Administrador")}
            className={`px-2.5 py-1 text-[11px] rounded-full border transition-all cursor-pointer font-medium ${
              filterRole === "Administrador"
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-surface text-text-muted border-border hover:bg-surface-hover"
            }`}
          >
            Administradores ({counts.admin})
          </button>
          <button
            onClick={() => setFilterRole("Operador")}
            className={`px-2.5 py-1 text-[11px] rounded-full border transition-all cursor-pointer font-medium ${
              filterRole === "Operador"
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-surface text-text-muted border-border hover:bg-surface-hover"
            }`}
          >
            Operadores ({counts.operador})
          </button>
          <button
            onClick={() => setFilterRole("Auditor")}
            className={`px-2.5 py-1 text-[11px] rounded-full border transition-all cursor-pointer font-medium ${
              filterRole === "Auditor"
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-surface text-text-muted border-border hover:bg-surface-hover"
            }`}
          >
            Auditores ({counts.auditor})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario o nombre..."
            className="w-full h-8 bg-surface text-text placeholder:text-text-faint text-xs rounded-control border border-border-input pl-8 pr-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-all"
          />
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-text-muted">
              Cargando catálogo de usuarios...
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted">
              No se encontraron usuarios registrados {searchTerm && `para "${searchTerm}"`}.
            </div>
          ) : (
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/60 text-text-muted text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-16">ID</th>
                  <th className="py-2.5 px-3">Usuario y Credencial</th>
                  <th className="py-2.5 px-3">Nombre Completo</th>
                  <th className="py-2.5 px-3">Rol de Privilegio</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsuarios.map((u) => {
                  const isRootAdmin = u.username.toLowerCase() === "admin";
                  const isCurrentSessionUser = currentUser?.id === u.id;
                  const cannotDelete = isRootAdmin || isCurrentSessionUser;

                  const initials = u.nombre
                    ? u.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : u.username.slice(0, 2).toUpperCase();

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-surface-hover/40 transition-colors group h-10"
                    >
                      <td className="py-2 px-3 font-mono text-text-muted tabular-nums">
                        #{u.id}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[10px] font-semibold text-text shrink-0">
                            {initials}
                          </div>
                          <span className="font-mono font-medium text-text">
                            @{u.username}
                          </span>
                          {isCurrentSessionUser && (
                            <span className="text-[10px] text-accent font-semibold px-1.5 py-0.2 rounded bg-accent/10 border border-accent/20">
                              Tú
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-medium text-text">
                        {u.nombre}
                      </td>
                      <td className="py-2 px-3">
                        {getRoleBadge(u.rol)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(u)}
                            title="Editar usuario"
                            className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (!cannotDelete) setDeletingItem(u);
                            }}
                            disabled={cannotDelete}
                            title={
                              isRootAdmin
                                ? "No se puede eliminar la cuenta raíz de administración"
                                : isCurrentSessionUser
                                ? "No puedes darte de baja a ti mismo mientras estás autenticado"
                                : "Dar de baja usuario"
                            }
                            className={`p-1 rounded transition-colors ${
                              cannotDelete
                                ? "text-text-faint opacity-40 cursor-not-allowed"
                                : "text-text-muted hover:text-danger hover:bg-danger/10 cursor-pointer"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Creación / Edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? `Editar Usuario #${editingItem.id} (@${editingItem.username})` : "Registrar Nuevo Usuario"}
        description={
          editingItem
            ? "Modifique los datos de acceso o el rol del usuario en el sistema."
            : "Complete los datos para generar una nueva credencial con control criptográfico."
        }
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
          <Input
            label="Nombre completo del titular"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Carlos Gómez Morales"
            maxLength={63}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: cgomez"
              maxLength={31}
              required
            />

            <Select
              label="Rol asignado"
              value={rol}
              onChange={(e) => setRol(e.target.value as UserRole)}
              required
              disabled={editingItem?.username.toLowerCase() === "admin"}
            >
              <option value="Operador">Operador (Emisión, despacho y clientes)</option>
              <option value="Auditor">Auditor (Reportes y liquidaciones)</option>
              <option value="Administrador">Administrador (Control total)</option>
            </Select>
          </div>

          <Input
            label={editingItem ? "Contraseña de acceso" : "Contraseña inicial"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              editingItem
                ? "Dejar en blanco para conservar la actual"
                : "•••••••• (mínimo 4 caracteres)"
            }
            helperText={
              editingItem
                ? "Opcional: Ingrese una nueva clave únicamente si desea restablecerla."
                : "Se requerirá para el inicio de sesión inicial del usuario."
            }
            maxLength={63}
            required={!editingItem}
          />

          {editingItem?.username.toLowerCase() === "admin" && (
            <div className="flex items-start gap-2 p-2.5 rounded-control bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[12px] leading-relaxed">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Cuenta raíz protegida:</span> Por directiva de seguridad del sistema, el rol de la cuenta principal <span className="font-mono font-medium">@admin</span> es inmutable.
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeModal}
              disabled={saveMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saveMutation.isPending}
              className="gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{editingItem ? "Guardar cambios" : "Crear usuario"}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* ConfirmDialog de Baja Lógica */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) deleteMutation.mutate(deletingItem.id);
        }}
        variant="danger"
        title="Confirmar Baja de Usuario"
        message={`¿Desea dar de baja al usuario @${deletingItem?.username} (${deletingItem?.nombre})?`}
        description="Esta acción desactivará lógicamente al usuario en la base de datos de usuarios. El usuario perderá acceso inmediato al sistema."
        confirmText="Dar de baja"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
