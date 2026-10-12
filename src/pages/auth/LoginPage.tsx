import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import { Package, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Por favor ingrese usuario y contraseña");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login(username, password);
      setAuth(res.access_token, res.user);
      toast.success(`Sesión iniciada como ${res.user.nombre}`);
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Credenciales inválidas");
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base font-bold text-white tracking-tight">UMG</span>
              <span className="text-base font-bold text-amber-500 tracking-tight">Express</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Control logístico</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1425] p-5 space-y-4">
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Iniciar sesión</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingrese sus credenciales de acceso
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
              leftIcon={<User className="w-3.5 h-3.5" />}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              leftIcon={<Lock className="w-3.5 h-3.5" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full mt-1"
              isLoading={isLoading}
            >
              Ingresar
            </Button>
          </form>

          {/* Cuentas de demostración */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-400">Credenciales de prueba:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin", "admin123")}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="font-mono text-xs text-slate-200">admin</div>
                <div className="text-[10px] text-slate-500">Administrador</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("operador1", "op123password")}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="font-mono text-xs text-slate-200">operador1</div>
                <div className="text-[10px] text-slate-500">Operador</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
