# Especificación de Reportes Operativos y Financieros — UMG Express Frontend

**Universidad Mariano Gálvez de Guatemala (UMG)**  
**Proyecto Académico — Sistema de Gestión Logística y Paquetería**

---

## 1. Módulos de Reportes Implementados

El frontend proporciona tres herramientas de consulta e inteligencia logística:

1. **Rastreo de Guía en Tiempo Real (`/rastreo`)**
2. **Manifiesto de Carga Vehicular (`/manifiesto`)**
3. **Liquidación Financiera y Auditoría (`/liquidacion`)**

---

## 2. Reporte de Rastreo de Guías (`src/pages/reportes/RastreoPage.tsx`)

Permite a operadores, clientes y auditores consultar la trazabilidad completa de cualquier paquete ingresando su número correlativo (ej. `1001`).

### Componentes de la Vista:
* **Buscador Inmediato:** Campo de búsqueda por número de guía con botón de consulta y respuesta asíncrona.
* **Línea de Tiempo (Stepper):** Indicador gráfico de avance con cuatro hitos:
  1. *Registrada en Sucursal*
  2. *Asignada a Vehículo*
  3. *En Tránsito Logístico*
  4. *Entregada a Destinatario*
* **Ficha Técnica del Envío:**
  - Datos de remitente y destinatario con teléfonos y direcciones.
  - Sucursal de origen y sucursal de destino.
  - Peso báscula, peso volumétrico y volumen en $m^3$.
  - Desglose de costos en Quetzales.
  - Asignación de transporte (Placa del vehículo y nombre del piloto si la guía ya fue despachada).

---

## 3. Reporte de Manifiesto de Carga (`src/pages/reportes/ManifiestoPage.tsx`)

Documento oficial de control de carga para los pilotos de ruta y retenes de transporte.

### Componentes de la Vista:
* **Selector de Vehículo:** Filtro por vehículo para consultar despachos activos.
* **Encabezado Institucional:** Placa, modelo, nombre del piloto, número de licencia, ruta cubierta y fecha de emisión.
* **Resumen de Carga Vehicular:**
  - Peso transportado vs capacidad máxima del vehículo en kg.
  - Volumen transportado vs capacidad máxima en $m^3$.
  - Cantidad total de paquetes en el viaje.
* **Tabla Pormenorizada de Paquetes:** Listado de guías con remitente, destinatario, peso y contenido.
* **Modo Impresión Oficial:** Botón de impresión directa (`window.print()`) con estilos CSS optimizados para hoja de ruta en formato carta/A4 sin barras laterales ni elementos de navegación.

---

## 4. Reporte de Liquidación Financiera (`src/pages/reportes/LiquidacionPage.tsx`)

Vista ejecutiva y de auditoría que consolida los ingresos generados por los servicios de paquetería y el volumen operativo movilizado.

### Componentes de la Vista:
* **Tarjetas de KPIs Consolidados:**
  - **Recaudación Total:** Sumatoria en Quetzales de todas las guías emitidas.
  - **Total de Guías:** Cantidad acumulada de envíos procesados.
  - **Peso Total Movilizado:** Suma de peso facturable en kilogramos.
  - **Volumen Total Movilizado:** Suma de metros cúbicos ($m^3$) transportados.
* **Consolidado por Sucursal de Origen:** Cuadre financiero que refleja ingresos y guías originadas en cada sucursal.
* **Consolidado por Ruta Logística:** Rentabilidad por tramo interdepartamental.
* **Distribución por Estado:** Total recaudado en guías Registradas, Despachadas y Entregadas.
