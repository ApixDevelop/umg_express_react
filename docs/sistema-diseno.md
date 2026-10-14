# Sistema de Diseño UI/UX (admin-ui) — UMG Express Frontend

**Universidad Mariano Gálvez de Guatemala (UMG)**  
**Proyecto Académico — Sistema de Gestión Logística y Paquetería**

---

## 1. Filosofía de Diseño

El diseño de **UMG Express** adopta la especificación **admin-ui**, orientada a herramientas operativas de misión crítica y paneles logísticos empresariales. Prioriza:

1. **Densidad de Información:** Maximizar el contenido útil en pantalla sin requerir desplazamientos innecesarios.
2. **Claridad Operativa:** Distinción inmediata de estados (en tránsito, despachado, capacidad disponible, alertas).
3. **Alto Contraste y Descanso Visual:** Paleta oscura con contrastes equilibrados para jornadas de trabajo prolongadas.
4. **Cero Distracciones ("AI Tells" erradicados):** Sin gradientes de arcoíris, sin tarjetas flotantes translúcidas sobredimensionadas, sin bordes fluorescentes y sin elementos decorativos que no aporten valor a la operación.

---

## 2. Paleta de Colores y Tokens CSS

Definidos a nivel raíz en `src/index.css` y en clases de utilidad Tailwind:

| Token / Elemento | Valor Hex | Uso en la Aplicación |
| :--- | :--- | :--- |
| **Fondo Base** | `#111215` | Color de fondo de la ventana principal y áreas vacías. |
| **Superficie / Paneles** | `#18191d` | Contenedores de tarjetas (`Card`), tablas y formularios. |
| **Superficie Secundaria** | `#15161a` | Encabezados de tabla, barra superior fija y modales. |
| **Bordes Estructurales**| `#26282e` | Separadores de filas, bordes de inputs y límites de panel. |
| **Acento Primario** | `#f68e00` | Color corporativo UMG Express (Ámbar/Naranja) para acciones clave y foco. |
| **Hover de Acento** | `#e07f00` | Estado activo o sobrevolado de botones principales. |
| **Texto Primario** | `#e6e8eb` | Títulos, valores de datos y etiquetas de alta prioridad. |
| **Texto Secundario** | `#8b909a` | Descripciones, encabezados de columnas e instrucciones. |
| **Texto Atenuado** | `#555a64` | Marcadores de posición (*placeholders*) y datos deshabilitados. |

### Semáforo Operativo (Badges de Estado)
* **Verde Esmeralda (`#10b981` / `bg-emerald-950/40 text-emerald-400`):** Guía Entregada, Vehículo Disponible, Sucursal Activa.
* **Ámbar / Naranja (`#f59e0b` / `bg-amber-950/40 text-amber-400`):** Guía Registrada (pendiente de carga), Capacidad vehicular > 80%.
* **Azul Zafiro (`#3b82f6` / `bg-blue-950/40 text-blue-400`):** Guía Despachada, Vehículo En ruta.
* **Rojo Escarlata (`#ef4444` / `bg-rose-950/40 text-rose-400`):** Guía Cancelada, Vehículo en Mantenimiento / Taller, Capacidad superada (> 100%).

---

## 3. Tipografía y Regla de Números Tabulares

- **Fuente:** Pila sans-serif de alto rendimiento del sistema:
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  ```
- **Números Tabulares (`tabular-nums`):** Todos los campos numéricos de negocio emplean ancho de cifra uniforme para alineación perfecta de columnas:
  - Números correlativos de guía: `#1001`, `#1002`.
  - Costos y totales en Quetzales: `Q 150.00`, `Q 1,280.50`.
  - Pesos y medidas: `12.50 kg`, `0.45 m³`.
  - NITs de clientes: `1234567-8`.

---

## 4. Sistema de Radios de Borde y Escala Espacial

* **Contenedores y Paneles:** Radios sutiles de **6px** (`rounded-md`).
* **Botones y Campos de Texto:** Radios de **4px** (`rounded`).
* **Micro-interacciones:** Transiciones de 150ms (`transition-colors duration-150`) para cambios de estado de botones e hipervínculos.
* **Prevención de Solapamiento:** 
  - `Topbar` con altura fija de 56px (`h-14`) y clase `sticky top-0 z-30`.
  - Contenedor de contenido principal con margen superior compensado de 56px (`pt-14`) para asegurar que ningún botón o título quede oculto bajo la barra.

---

## 5. Catálogo de Componentes UI Atómicos

1. **`Button` (`src/components/ui/Button.tsx`):** Variantes `primary`, `secondary`, `danger` y `ghost`. Soporta estado de carga con indicador giratorio y deshabilitación accesible.
2. **`Input` (`src/components/ui/Input.tsx`):** Campo con etiqueta superior, mensaje de error en rojo escarlata y soporte para prefijos/sufijos (e.g. "Q", "kg", "cm").
3. **`Select` (`src/components/ui/Select.tsx`):** Desplegable con estilos coincidentes para selección de sucursales, vehículos, rutas y tipos de carga.
4. **`Badge` (`src/components/ui/Badge.tsx`):** Etiqueta compacta con punto de pulso para estados en tiempo real.
5. **`Card` (`src/components/ui/Card.tsx`):** Contenedor estructural con encabezado delimitado por borde fino.
6. **`Modal` (`src/components/ui/Modal.tsx`):** Diálogo emergente accesible con fondo oscurecido para confirmaciones y formularios rápidos.
7. **`CapacityBar` (`src/components/ui/CapacityBar.tsx`):** Barra de progreso segmentada para control físico vehicular de peso y volumen.
8. **`StatCard` (`src/components/ui/StatCard.tsx`):** Tarjeta de indicador clave con valor tabular y comparativa.
