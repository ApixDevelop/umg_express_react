# Estado del Proyecto — UMG Express Frontend

**Universidad Mariano Gálvez de Guatemala (UMG)**  
**Facultad de Ingeniería en Sistemas de Información y Ciencias de la Computación**  
**Proyecto Académico — Sistema de Gestión Logística y Paquetería**

---

## Información General

* **Proyecto:** UMG Express (Frontend Web SPA)
* **Versión:** 1.0.0
* **Fase Actual:** Fase 7 — Documentación Final e Integración con Backend
* **Estado:** Completado y Verificado
* **Rama Activa:** `feat/v1`
* **Resultado de Build:** Exitoso (`tsc -b && vite build` en ~280ms)

---

## 1. Bitácora de Fases del Frontend

### Fase 1 — Inicialización y Tooling
- **Estado:** COMPLETADA
- **Logros:**
  - Configuración del proyecto con Vite 8, React 19 y TypeScript estricto.
  - Integración de Tailwind CSS v4 con variables CSS y tema oscuro base.
  - Configuración del cliente Axios con soporte de proxy hacia Crow (`127.0.0.1:18080`).

### Fase 2 — Autenticación y Shell Operativo
- **Estado:** COMPLETADA
- **Logros:**
  - Almacén de sesión `authStore` con Zustand y persistencia en `localStorage`.
  - Guardias de navegación `ProtectedRoute` y `RoleGuard` (RBAC para Administrador, Operador y Auditor).
  - Componente `AppLayout` con `Sidebar` responsivo y `Topbar` con datos de sesión y logout.

### Fase 3 — Catálogos Maestros (CRUDs)
- **Estado:** COMPLETADA
- **Logros:**
  - Módulos CRUD completos para Sucursales, Clientes (validación de NIT), Rutas, Vehículos, Pilotos, Tarifas y Usuarios.
  - Integración de bajas lógicas y diálogos modales de confirmación.

### Fase 4 — Transacciones y Operaciones Logísticas
- **Estado:** COMPLETADA
- **Logros:**
  - Pantalla de Emisión de Guías (`GuiasPage`) con cálculo dinámico en vivo de peso volumétrico y tarificación en Quetzales.
  - Pantalla de Despacho (`DespachoPage`) con cálculo acumulado de peso/volumen y barra visual de capacidad vehicular.

### Fase 5 — Reportería e Inteligencia Operativa
- **Estado:** COMPLETADA
- **Logros:**
  - Módulo de Rastreo de Guías (`RastreoPage`) con línea de tiempo visual.
  - Módulo de Manifiesto de Carga (`ManifiestoPage`) con soporte de impresión oficial.
  - Módulo de Liquidación Financiera (`LiquidacionPage`) con tarjetas de KPIs y cuadre por sucursal/ruta.

### Fase 6 — Rediseño Integral de UI/UX (admin-ui)
- **Estado:** COMPLETADA
- **Logros:**
  - Adopción estricta del estándar `admin-ui` para interfaces industriales: paleta sobria (`#111215`, `#18191d`, bordes `#26282e`, acento institucional ámbar `#f68e00`).
  - Corrección de bugs de solapamiento en encabezados de tabla y botones superiores.
  - Números tabulares (`tabular-nums`) en todas las tablas y resúmenes financieros.
  - Cero "AI tells" (sin gradientes morados/azules genéricos ni sombras excesivas).

### Fase 7 — Documentación Técnica e Integración Completa
- **Estado:** COMPLETADA
- **Logros:**
  - Estructuración de la carpeta `docs/` en espejo exacto de la documentación del backend C++17.
  - Generación de manuales técnicos de arquitectura, integración de API, autenticación RBAC, sistema de diseño, cálculos matemáticos, despacho y reportes.
  - Actualización del `README.md` institucional.

---

## 2. Matriz de Cobertura de Vistas y Componentes

| Módulo / Vista | Ruta | Componentes Clave | Estado |
| :--- | :--- | :--- | :---: |
| **Login** | `/login` | Formulario, validación de credenciales, feedback | 100% |
| **Dashboard** | `/dashboard` | `StatCard`, resumen de envíos, accesos rápidos | 100% |
| **Guías** | `/guias` | Tabla, filtros, modal de emisión con cálculo volumétrico | 100% |
| **Despacho** | `/despacho` | Selector vehicular, `CapacityBar`, consolidación de carga | 100% |
| **Rastreo** | `/rastreo` | Buscador correlativo, stepper cronológico, ficha técnica | 100% |
| **Manifiesto** | `/manifiesto` | Detalle de ruta y piloto, tabla de carga, impresión | 100% |
| **Liquidación** | `/liquidacion` | KPIs de ingresos, cuadres por sucursal y ruta | 100% |
| **Sucursales** | `/sucursales` | CRUD, modal de edición, baja lógica | 100% |
| **Clientes** | `/clientes` | CRUD con validación de NIT, búsqueda rápida | 100% |
| **Rutas** | `/rutas` | CRUD con cálculo de distancias | 100% |
| **Vehículos** | `/vehiculos` | CRUD con capacidades de peso y volumen, estados | 100% |
| **Pilotos** | `/pilotos` | CRUD con licencias de conducir | 100% |
| **Tarifas** | `/tarifas` | CRUD con costos base, por kg, por m³ y recargos | 100% |
| **Usuarios** | `/usuarios` | CRUD con asignación de roles (RBAC) | 100% |
