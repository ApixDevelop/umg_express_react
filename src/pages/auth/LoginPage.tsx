import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import { Package, Lock, User, Sun, Moon, Monitor, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { theme, resolvedTheme, toggleTheme } = useThemeStore();

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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-surface text-text">
      {/* Columna Izquierda: Formulario de Login (40% - 45% en Desktop) */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10 bg-surface">
        {/* Cabecera superior: Logo & Selector de tema */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-control bg-accent text-on-accent font-bold shadow-sm shadow-accent/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[17px] font-black tracking-tight text-text">UMG</span>
                <span className="text-[17px] font-black tracking-tight text-accent">Express</span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 font-medium tracking-wide">Control Logístico</p>
            </div>
          </div>

          {/* Toggle de tema discreto */}
          <button
            type="button"
            onClick={toggleTheme}
            title={"Tema: " + (theme === "system" ? "Auto" : resolvedTheme === "dark" ? "Oscuro" : "Claro")}
            className="h-8 px-2.5 rounded-control border border-border bg-surface-hover/60 hover:bg-surface-hover text-text flex items-center gap-1.5 text-xs cursor-pointer active:scale-[0.97] transition-all"
          >
            {theme === "system" ? (
              <Monitor className="w-3.5 h-3.5 text-accent" />
            ) : resolvedTheme === "dark" ? (
              <Moon className="w-3.5 h-3.5 text-accent" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-accent" />
            )}
            <span className="text-[11px] text-text-muted capitalize hidden sm:inline">
              {theme === "system" ? "Auto" : resolvedTheme}
            </span>
          </button>
        </div>

        {/* Centro: Formulario Principal de Autenticación */}
        <div className="w-full max-w-sm mx-auto my-8 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-[26px] font-bold text-text tracking-tight">Iniciar Sesión</h1>
            <p className="text-[13px] text-text-muted">
              ¿No tienes cuenta?{" "}
              <span className="text-accent hover:underline font-medium cursor-pointer">
                Contacta al Administrador
              </span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: admin"
              leftIcon={<User className="w-3.5 h-3.5" />}
              autoComplete="username"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-3.5 h-3.5" />}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-[12px] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-text-muted hover:text-text">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border-input text-accent focus:ring-accent accent-accent cursor-pointer"
                />
                <span>Recordar sesión</span>
              </label>

              <button
                type="button"
                onClick={() => toast.info("Por favor comuníquese con el administrador del sistema para restablecer credenciales.")}
                className="text-text-muted hover:text-accent transition-colors"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 text-[14px] font-semibold tracking-wide shadow-md shadow-accent/25 active:scale-[0.98] mt-2 gap-2"
              isLoading={isLoading}
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Cuentas de demostración rápida */}
          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              <span>Accesos rápidos de prueba</span>
              <span className="text-accent font-normal">Click para cargar</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin", "admin123")}
                className="p-2.5 rounded-control bg-surface-hover/50 hover:bg-surface-hover border border-border hover:border-accent/40 text-left transition-all active:scale-[0.97] cursor-pointer group"
              >
                <div className="text-[12px] text-text font-bold group-hover:text-accent font-mono">admin</div>
                <div className="text-[11px] text-text-muted">Administrador</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("operador1", "op123password")}
                className="p-2.5 rounded-control bg-surface-hover/50 hover:bg-surface-hover border border-border hover:border-accent/40 text-left transition-all active:scale-[0.97] cursor-pointer group"
              >
                <div className="text-[12px] text-text font-bold group-hover:text-accent font-mono">operador1</div>
                <div className="text-[11px] text-text-muted">Operador Logístico</div>
              </button>
            </div>
          </div>
        </div>

        {/* Pie de página inferior legal */}
        <div className="text-[11px] text-text-faint text-center sm:text-left space-y-1 pt-4 border-t border-border/40">
          <p>© {new Date().getFullYear()} UMG Express, S.A. Todos los derechos reservados.</p>
          <div className="flex items-center justify-center sm:justify-start gap-3 text-text-muted">
            <span className="hover:text-text cursor-pointer">Términos del Servicio</span>
            <span>·</span>
            <span className="hover:text-text cursor-pointer">Política de Privacidad</span>
            <span>·</span>
            <span className="font-mono">v2.4.0</span>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Ilustración Vectorial Hero Showcase (55% - 60% en Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 relative overflow-hidden bg-[#0c1020] flex-col justify-between p-10 xl:p-14 select-none">
        {/* Imagen de fondo de alta resolución estilo SeedProd (Rocket express transport) */}
        <img
          src="/login-hero.jpg"
          alt="UMG Express Logistics"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-[1.02] filter brightness-95"
        />

        {/* Gradiente ambiental oscuro sobre la imagen para legibilidad y elegancia */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b16] via-transparent to-[#080b16]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent pointer-events-none opacity-40" />

        {/* Chip superior de estado flotante */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white text-[12px] font-medium shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono">API Crow C++17 en Línea</span>
            <span className="text-white/40">|</span>
            <span className="text-white/70">Puerto 18080</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[12px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Control Criptográfico RBAC</span>
          </div>
        </div>

        {/* Tarjeta de impacto inferior con glassmorphism */}
        <div className="relative z-10 max-w-xl">
          <div className="p-6 rounded-2xl bg-black/55 backdrop-blur-xl border border-white/15 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-accent text-[12px] font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Plataforma de Alta Velocidad</span>
            </div>

            <h2 className="text-[26px] xl:text-[30px] font-black text-white leading-tight tracking-tight">
              Control total de tu flota y paquetería en tiempo real
            </h2>

            <p className="text-[13px] text-white/80 leading-relaxed">
              Emisión con pesaje volumétrico IATA, asignación de carga vehicular con radar anti-sobrepeso
              y arqueo financiero unificado para toda Guatemala.
            </p>

            {/* Micro métricas */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10 text-white">
              <div>
                <div className="text-[11px] text-white/60">Precisión</div>
                <div className="font-mono font-bold text-[15px] text-accent">100% Métrica</div>
              </div>
              <div>
                <div className="text-[11px] text-white/60">Capacidad</div>
                <div className="font-mono font-bold text-white">Doble Radar</div>
              </div>
              <div>
                <div className="text-[11px] text-white/60">Cobertura</div>
                <div className="font-mono font-bold text-white">Nacional GT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
