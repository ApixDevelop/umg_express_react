import React, { useState } from "react";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { toast } from "sonner";
import type { UserRole } from "@/types";

export function UsuariosPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<UserRole>("Operador");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !nombre.trim()) {
      toast.error("Complete todos los campos del usuario");
      return;
    }

    setIsLoading(true);
    try {
      const u = await authApi.crearUsuario({ username, password, nombre, rol });
      toast.success(`Usuario "${u.username}" registrado con rol ${u.rol}`);
      setUsername("");
      setPassword("");
      setNombre("");
      setRol("Operador");
    } catch (err: any) {
      toast.error(err.message || "Error al crear usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-[720px]">
      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Usuarios</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Alta de credenciales y asignación de roles de acceso al sistema
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Carlos Gómez Morales"
            maxLength={63}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: cgomez"
              maxLength={31}
              required
            />
            <Input
              label="Contraseña inicial"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              maxLength={63}
              required
            />
          </div>

          <Select
            label="Rol de acceso"
            value={rol}
            onChange={(e) => setRol(e.target.value as UserRole)}
            required
          >
            <option value="Operador">Operador (Emisión de guías, despacho y clientes)</option>
            <option value="Auditor">Auditor (Acceso a reportes y liquidación financiera)</option>
            <option value="Administrador">Administrador (Control total de catálogos y usuarios)</option>
          </Select>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
            >
              Registrar usuario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
