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
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-accent text-on-accent font-bold">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base font-bold text-text tracking-tight">UMG</span>
              <span className="text-base font-bold text-accent tracking-tight">Express</span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">Control logístico</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-panel border border-border bg-surface p-5 space-y-4">
          <div>
            <h1 className="text-[16px] font-semibold text-text">Iniciar sesión</h1>
            <p className="text-[12px] text-text-muted mt-0.5">
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
          <div className="pt-3 border-t border-border space-y-2">
            <p className="text-[11px] text-text-muted">Credenciales de prueba:</p>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin", "admin123")}
                className="p-2 rounded-control bg-surface-hover border border-border text-left hover:border-border-input transition-colors cursor-pointer"
              >
                <div className="text-[12px] text-text font-medium">admin</div>
                <div className="text-[11px] text-text-muted">Administrador</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("operador1", "op123password")}
                className="p-2 rounded-control bg-surface-hover border border-border text-left hover:border-border-input transition-colors cursor-pointer"
              >
                <div className="text-[12px] text-text font-medium">operador1</div>
                <div className="text-[11px] text-text-muted">Operador</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}