import React, { useState } from "react";
import { authApi } from "@/api/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ShieldCheck, UserPlus, Key, User } from "lucide-react";
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
      toast.success(`Usuario "${u.username}" registrado exitosamente con rol ${u.rol}`);
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
    <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white font-heading">
          Alta de Usuarios del Sistema
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Registro de credenciales y asignación de roles de acceso RBAC protegidos con hash SHA-256 en <code className="text-amber-400">data/usuarios.dat</code>.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre Completo del Usuario"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Carlos Gómez Morales"
            maxLength={63}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre de Usuario (Login)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: operador_central"
              maxLength={31}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              maxLength={63}
              leftIcon={<Key className="w-4 h-4" />}
              required
            />
          </div>

          <Select
            label="Rol Institucional Asignado"
            value={rol}
            onChange={(e) => setRol(e.target.value as UserRole)}
            required
          >
            <option value="Operador">Operador (Emisión de guías, despacho y clientes)</option>
            <option value="Auditor">Auditor (Acceso a reportes y liquidación financiera)</option>
            <option value="Administrador">Administrador (Control total de catálogos y usuarios)</option>
          </Select>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p>
              El usuario será persistido en el archivo binario <strong className="text-slate-200 font-mono">usuarios.dat</strong>. La contraseña se almacenará con un hash criptográfico de 1,000 rondas y sal única ($pbk$).
            </p>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Registrar Nuevo Usuario
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
