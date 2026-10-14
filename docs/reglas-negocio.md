# Reglas de Negocio en Frontend — UMG Express

**Universidad Mariano Gálvez de Guatemala (UMG)**  
**Proyecto Académico — Sistema de Gestión Logística y Paquetería**

---

## 1. Principio de Validación en Espejo

El frontend de **UMG Express** implementa validación anticipada en el cliente con **React Hook Form + Zod** para asegurar que ninguna petición sea despachada al backend con datos erróneos o inválidos, reflejando estrictamente las restricciones de negocio del backend en C++17.

---

## 2. Reglas del Dominio Logístico

### 2.1 Identificadores y Correlativos
- **Guías de Envío:** La numeración de guías inicia en el número correlativo **1001** y se incrementa automáticamente. El operador no puede modificar manualmente el número asignado.
- **Identificadores Maestros:** Los códigos de sucursales, clientes, vehículos y rutas deben ser enteros positivos únicos.

### 2.2 Validación de Clientes y NITs
- Cada cliente registrado debe poseer un **NIT único** en formato guatemalteco (e.g., `1234567-8` o `CF`).
- El formulario valida que el NIT no contenga caracteres inválidos antes de realizar el envío.
- Un cliente no puede ser eliminado si tiene guías activas asociadas.

### 2.3 Política de Baja Lógica
- Ningún registro de catálogo se destruye físicamente de forma inmediata.
- Las eliminaciones cambian la propiedad `activo = false`.
- En las vistas operativas de selección (e.g. desplegable de sucursales o clientes al emitir guía), únicamente se listan las entidades con `activo === true`.
- Todas las acciones de baja exigen confirmación en un diálogo modal para evitar eliminaciones accidentales.

---

## 3. Máquinas de Estado Operativas

### 3.1 Ciclo de Vida de una Guía de Envío
```text
[Emisión] -> Estado: Registrada
                │
                ▼ (Asignada en Despacho)
             Estado: Despachada
                │
                ▼ (Confirmación de Entrega)
             Estado: Entregada
```
* **Registrada:** Guía creada y pagada; el paquete se encuentra en bodega de la sucursal origen esperando transporte.
* **Despachada:** La guía ha sido consolidada en un vehículo de carga y el transporte se encuentra en trayecto.
* **Entregada:** El paquete llegó a la sucursal de destino y fue recibido por el cliente.
* **Cancelada:** Guía anulada por el operador antes de ser despachada.

### 3.2 Estados Operacionales del Vehículo
* **Disponible:** El vehículo está en patio y apto para ser cargado.
* **En ruta:** El vehículo ha sido despachado con un manifiesto y no puede recibir más carga hasta que finalice el viaje.
* **Mantenimiento:** El vehículo está en taller mecánico; el sistema bloquea su selección en el módulo de despacho.

---

## 4. Reglas del Módulo de Despacho Vehicular

1. **Selección de Vehículo:** Únicamente se permite cargar vehículos cuyo estado actual sea exactamente `"Disponible"`.
2. **Límite de Capacidad Física (Peso y Volumen):**
   - El peso total acumulado de las guías no debe exceder `capacidadPesoKg`.
   - El volumen total acumulado de las guías no debe exceder `capacidadVolumenM3`.
   - Si la suma sobrepasa el 100%, el botón de confirmación de despacho queda deshabilitado con un mensaje de alerta.
3. **Sucursal de Origen y Destino:** Todas las guías agrupadas en un mismo despacho deben pertenecer al tramo cubierto por la ruta seleccionada.
