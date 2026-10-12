import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import { Package, Lock, User, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
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
      toast.error("Por favor ingrese su usuario y contraseña");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login(username, password);
      setAuth(res.access_token, res.user);
      toast.success(`Bienvenido al sistema, ${res.user.nombre}`);
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
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 mb-4">
            <Package className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
            UMG <span className="text-amber-500">Express</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-mono mt-1">
            Sistema de Control Logístico y Paquetería
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-2xl p-7 shadow-2xl shadow-black/60">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-100">Iniciar Sesión</h2>
            <p className="text-xs text-slate-400 mt-1">
              Ingrese sus credenciales registradas para acceder al sistema.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: admin"
              leftIcon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ingresar al Sistema
            </Button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Acceso Rápido de Prueba:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin", "admin123")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-amber-400">admin</div>
                <div className="text-[10px] text-slate-400">Administrador</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("operador1", "op123password")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-indigo-400">operador1</div>
                <div className="text-[10px] text-slate-400">Operador</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
          <span>Autenticación protegida con Bearer Token & CSPRNG</span>
        </div>
      </div>
    </div>
  );
}
