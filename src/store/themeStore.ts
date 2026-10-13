import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDocument(resolved: "dark" | "light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme: (theme: ThemeMode) => {
        const resolved = theme === "system" ? getSystemTheme() : theme;
        applyThemeToDocument(resolved);
        set({ theme, resolvedTheme: resolved });
      },
      toggleTheme: () => {
        const current = get().theme;
        const next: ThemeMode = current === "dark" ? "light" : current === "light" ? "system" : "dark";
        const resolved = next === "system" ? getSystemTheme() : next;
        applyThemeToDocument(resolved);
        set({ theme: next, resolvedTheme: resolved });
      },
      initTheme: () => {
        const { theme } = get();
        const resolved = theme === "system" ? getSystemTheme() : theme;
        applyThemeToDocument(resolved);
        set({ resolvedTheme: resolved });

        if (typeof window !== "undefined") {
          const media = window.matchMedia("(prefers-color-scheme: dark)");
          const listener = () => {
            if (get().theme === "system") {
              const sysResolved = getSystemTheme();
              applyThemeToDocument(sysResolved);
              set({ resolvedTheme: sysResolved });
            }
          };
          media.addEventListener("change", listener);
        }
      },
    }),
    {
      name: "umg_express_theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initTheme();
        }
      },
    }
  )
);
