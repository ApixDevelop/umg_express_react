import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppRoutes } from "@/routes/AppRoutes";

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
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        richColors
        position="bottom-right"
        theme="dark"
        closeButton
        toastOptions={{
          className: "font-sans text-[13px] border border-border bg-surface text-text shadow-lg",
          style: {
            background: "#18191d",
            border: "1px solid #2a2c33",
            color: "#ededf0",
          },
        }}
      />
      <AppRoutes />
    </QueryClientProvider>
  );
}
