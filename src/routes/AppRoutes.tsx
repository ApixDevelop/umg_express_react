import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { AppLayout } from "@/components/layout/AppLayout";

import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { GuiasPage } from "@/pages/transacciones/GuiasPage";
import { DespachoPage } from "@/pages/transacciones/DespachoPage";
import { RastreoPage } from "@/pages/reportes/RastreoPage";
import { ManifiestoPage } from "@/pages/reportes/ManifiestoPage";
import { LiquidacionPage } from "@/pages/reportes/LiquidacionPage";

import { SucursalesPage } from "@/pages/catalogos/SucursalesPage";
import { ClientesPage } from "@/pages/catalogos/ClientesPage";
import { RutasPage } from "@/pages/catalogos/RutasPage";
import { VehiculosPage } from "@/pages/catalogos/VehiculosPage";
import { PilotosPage } from "@/pages/catalogos/PilotosPage";
import { TarifasPage } from "@/pages/catalogos/TarifasPage";
import { UsuariosPage } from "@/pages/catalogos/UsuariosPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected application layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* General routes */}
          <Route index element={<DashboardPage />} />
          <Route path="rastreo" element={<RastreoPage />} />

          {/* Operations (Admin & Operador) */}
          <Route
            path="guias"
            element={
              <RoleGuard allowedRoles={["Administrador", "Operador"]}>
                <GuiasPage />
              </RoleGuard>
            }
          />
          <Route
            path="despacho"
            element={
              <RoleGuard allowedRoles={["Administrador", "Operador"]}>
                <DespachoPage />
              </RoleGuard>
            }
          />

          {/* Reports */}
          <Route
            path="manifiesto"
            element={
              <RoleGuard allowedRoles={["Administrador", "Operador", "Auditor"]}>
                <ManifiestoPage />
              </RoleGuard>
            }
          />
          <Route
            path="liquidacion"
            element={
              <RoleGuard allowedRoles={["Administrador", "Auditor"]}>
                <LiquidacionPage />
              </RoleGuard>
            }
          />

          {/* Catalogs (CRUD) */}
          <Route
            path="catalogos/sucursales"
            element={
              <RoleGuard allowedRoles={["Administrador"]}>
                <SucursalesPage />
              </RoleGuard>
            }
          />
          <Route
            path="catalogos/clientes"
            element={
              <RoleGuard allowedRoles={["Administrador", "Operador"]}>
                <ClientesPage />
              </RoleGuard>
            }
          />
          <Route
            path="catalogos/rutas"
            element={
              <RoleGuard allowedRoles={["Administrador"]}>
                <RutasPage />
              </RoleGuard>
            }
          />
          <Route
            path="catalogos/vehiculos"
            element={
              <RoleGuard allowedRoles={["Administrador"]}>
                <VehiculosPage />
              </RoleGuard>
            }
          />
          <Route
            path="catalogos/pilotos"
            element={
              <RoleGuard allowedRoles={["Administrador"]}>
                <PilotosPage />
              </RoleGuard>
            }
          />
          <Route
            path="catalogos/tarifas"
            element={
              <RoleGuard allowedRoles={["Administrador"]}>
                <TarifasPage />
              </RoleGuard>
            }
          />
          <Route
            path="catalogos/usuarios"
            element={
              <RoleGuard allowedRoles={["Administrador"]}>
                <UsuariosPage />
              </RoleGuard>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
