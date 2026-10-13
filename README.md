# UMG Express — Sistema de Gestión Logística y Paquetería (Frontend Web)

**Universidad Mariano Gálvez de Guatemala (UMG)**  
**Facultad de Ingeniería en Sistemas de Información y Ciencias de la Computación**  
**Proyecto Académico — Control Logístico y de Paquetería**

---

## 1. Descripción del Proyecto

**UMG Express Frontend** es la aplicación cliente web de alto rendimiento para el sistema integral de logística y paquetería express. Desarrollada con **React 19**, **TypeScript** y **Vite**, la plataforma provee a los operadores, administradores y auditores una interfaz gráfica industrial, sobria y eficiente para interactuar con la **API REST C++17 Crow** del backend.

La aplicación administra el ciclo de vida completo de los envíos:
- **Autenticación y Sesiones:** Acceso basado en roles (**RBAC**) con tokens Bearer.
- **Mantenimiento de Catálogos:** Sucursales, clientes (NIT), rutas, vehículos, pilotos y tarifas.
- **Emisión de Guías:** Numeración correlativa automática (1001+) y cálculo en tiempo real de **peso volumétrico** y costos en Quetzales.
- **Asignación y Despacho:** Control riguroso de capacidad física vehicular (peso en kg y volumen en $m^3$) con prevención de sobrecarga.
- **Reportería Operativa:** Rastreo con línea de tiempo, manifiesto de carga imprimible para pilotos y liquidación financiera consolidada.

---

## 2. Tecnologías y Restricciones Técnicas

* **Framework de Interfaz:** React 19 (SPA moderna con renderizado declarativo)
* **Lenguaje:** TypeScript estricto (espejo de los structs binarios C++17)
* **Herramienta de Construcción:** Vite 8 con Hot Module Replacement (HMR) ultra-rápido
* **Estilizado y Diseño:** Tailwind CSS v4 bajo la filosofía industrial **admin-ui** (tema oscuro de alto contraste)
* **Gestión de Estado Asíncrono:** TanStack Query v5 (caché determinista e invalidación reactiva)
* **Gestión de Sesión:** Zustand v5 con persistencia en `localStorage`
* **Enrutamiento Cliente:** React Router v8 con guardias de seguridad (`ProtectedRoute` y `RoleGuard`)
* **Notificaciones:** Sonner (*toasts* flotantes discretos)
* **Iconografía:** Lucide React

---

## 3. Estructura del Repositorio

```text
umg_express_react/
├── index.html                   # Documento HTML raíz y títulos SEO
├── vite.config.ts               # Configuración de Vite y proxy /v1 -> :18080
├── tsconfig.json                # Opciones de compilación TypeScript estricto
├── package.json                 # Dependencias y scripts del proyecto
├── src/
│   ├── main.tsx                 # Entrada de aplicación y QueryClientProvider
│   ├── App.tsx                  # Enrutador raíz y contenedor de notificaciones
│   ├── index.css                # Variables CSS, tokens de color y reglas tipográficas
│   ├── api/                     # Servicios REST cliente (Axios con interceptores Bearer)
│   ├── components/
│   │   ├── layout/              # Shell operativo (AppLayout, Topbar, Sidebar, Guardias RBAC)
│   │   └── ui/                  # Componentes atómicos (Button, Input, Badge, CapacityBar, Modal, Card)
│   ├── lib/                     # Fórmulas matemáticas (calculos.ts) y formateadores (utils.ts)
│   ├── pages/                   # Vistas principales (Auth, Dashboard, Guías, Despacho, Reportes, Catálogos)
│   ├── routes/                  # Definición de rutas cliente protegidas
│   ├── store/                   # Almacén de sesión de usuario (authStore.ts)
│   └── types/                   # Definición de interfaces TypeScript sincronizadas con C++
└── docs/                        # Documentación técnica completa del proyecto
    ├── arquitectura.md          # Arquitectura de capas, flujo de datos y estructura modular
    ├── api-integracion.md       # Contrato de integración REST, endpoints y manejo de errores
    ├── autenticacion-rbac.md    # Matriz RBAC, sesiones Bearer y guardias de seguridad
    ├── sistema-diseno.md        # Tokens de color, admin-ui, tabular-nums y directrices UX
    ├── reglas-negocio.md        # Reglas logísticas, correlativos, bajas lógicas y estados
    ├── calculos-guias.md        # Algoritmo de peso volumétrico y tarificación en Quetzales
    ├── despacho-control.md      # Algoritmo de control físico vehicular y ocupación
    ├── reportes-operativos.md   # Especificación de rastreo, manifiestos y liquidación
    └── estado-proyecto.md       # Bitácora de fases completadas y matriz de cobertura
```

---

## 4. Requisitos del Entorno

* **Node.js:** Versión 18.0.0 o superior (Recomendado Node 20+ LTS).
* **Gestor de Paquetes:** `npm` versión 9.0.0 o superior.
* **Backend UMG Express:** Servidor Crow C++17 corriendo en `http://127.0.0.1:18080` (para integración en vivo).

---

## 5. Instrucciones de Instalación y Ejecución

### 5.1 Instalación de Dependencias
Abra una terminal en la raíz del proyecto (`umg_express_react/`) y ejecute:
```bash
npm install
```

### 5.2 Ejecución en Servidor de Desarrollo
Para iniciar el servidor de desarrollo local con recarga en vivo:
```bash
npm run dev
```
La aplicación estará disponible de inmediato en:
```text
http://localhost:5173
```
> **Nota de Proxy:** Todas las peticiones dirigidas a `/v1` son redirigidas de forma transparente al servidor C++ en `http://127.0.0.1:18080`, eliminando cualquier conflicto de CORS.

### 5.3 Verificación de Tipos y Compilación de Producción
Para verificar la integridad estática de tipos y generar el paquete distribuible:
```bash
npm run build
```
El proceso compilará el proyecto en aproximadamente **280 ms** generando los artefactos optimizados en la carpeta `dist/`.

---

## 6. Usuarios y Credenciales de Prueba

El sistema cuenta con tres perfiles preconfigurados para validar la matriz RBAC:

| Usuario | Contraseña | Rol | Acceso Principal |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **Administrador** | Acceso total: operaciones, mantenimientos, reportes y usuarios |
| `operador` | `operador123` | **Operador** | Emisión de guías, despacho vehicular y rastreo |
| `auditor` | `auditor123` | **Auditor** | Dashboard, rastreo, manifiestos de carga y liquidación financiera |

---

## 7. Índice de Documentación Técnica

Para conocer a fondo la especificación de cada componente del frontend, consulte los documentos en la carpeta `docs/`:

1. [**Arquitectura de Software**](file:///C:/Users/marti/Desktop/umg%20expres/umg_express_react/docs/arquitectura.md): Diseño de capas, flujo de datos asíncronos y desacoplamiento modular.
2. [**Integración de API REST**](file:///C:/Users/marti/Desktop/umg%20expres/umg_express_react/docs/api-integracion.md): Endpoints consumidos, contratos JSON, códigos de respuesta e invalidación con TanStack Query.
3. [**Autenticación y RBAC**](file:///C:/Users/marti/Desktop/umg%20expres/umg_express_react/docs/autenticacion-rbac.md): Flujo de sesión Bearer, componentes `ProtectedRoute` y `RoleGuard`.
4. [**Sistema de Diseño UI/UX (admin-ui)**](file:///C:/Users/marti/Desktop/umg%20expres/umg_express_react/docs/sistema-diseno.md): Tokens de color (`#111215`, `#18191d`, `#f68e00`), tipografía tabular y componentes atómicos.
5. [**Reglas de Negocio en Frontend**](file:///C:/Users/marti/Desktop/umg%20expres/umg_express_react/docs/reglas-negocio.md): Validación de NITs, máquinas de estados de guías y vehículos, y bajas lógicas.
6. [**Algoritmo de Cálculo Volumétrico**](file:///C:/Users/marti/Desktop/umg%20expres/umg_express_react/docs/calculos-guias.md): Fórmulas matemáticas, peso facturable y tarificación en Quetzales.
7. [**Control de Despacho y Carga**](file:///C:/Users/marti/Desktop/umg%20expres/umg_express_react/docs/despacho-control.md): Algoritmo de control físico vehicular y barras de ocupación.
8. [**Especificación de Reportes**](file:///C:/Users/marti/Desktop/umg%20expres/umg_express_react/docs/reportes-operativos.md): Rastreo cronológico, manifiestos imprimibles y liquidación financiera.
9. [**Estado del Proyecto y Fases**](file:///C:/Users/marti/Desktop/umg%20expres/umg_express_react/docs/estado-proyecto.md): Bitácora de desarrollo, matriz de cobertura y verificación técnica.
