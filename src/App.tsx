import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppRoutes } from "@/routes/AppRoutes";
import { useThemeStore } from "@/store/themeStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export default function App() {
  const { resolvedTheme, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        richColors
        position="bottom-right"
        theme={resolvedTheme}
        closeButton
        toastOptions={{
          className: "font-sans text-[13px] border border-border bg-surface text-text shadow-lg",
          style: {
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          },
        }}
      />
      <AppRoutes />
    </QueryClientProvider>
  );
}
