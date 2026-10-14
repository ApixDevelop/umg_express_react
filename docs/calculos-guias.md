# Algoritmo de Cálculo Volumétrico y Tarificación — UMG Express Frontend

**Universidad Mariano Gálvez de Guatemala (UMG)**  
**Proyecto Académico — Sistema de Gestión Logística y Paquetería**

---

## 1. Fundamento Matemático y Logístico

En la industria del transporte y paquetería express, un paquete liviano pero de grandes dimensiones ocupa un espacio vehicular considerable que impide cargar otros paquetes. Por esta razón, el sistema calcula de forma estandarizada el **peso volumétrico** basándose en la normativa de la **Asociación Internacional de Transporte Aéreo (IATA)** adaptada al transporte terrestre nacional.

La lógica se encuentra centralizada en `src/lib/calculos.ts` y se ejecuta en tiempo real durante la emisión de guías.

---

## 2. Fórmulas de Cálculo Implementadas

### 2.1 Peso Volumétrico ($PV$)
Dadas las dimensiones del paquete en centímetros (cm):
$$\text{Peso Volumétrico (kg)} = \frac{\text{Largo (cm)} \times \text{Ancho (cm)} \times \text{Alto (cm)}}{5000}$$

### 2.2 Volumen en Metros Cúbicos ($V$)
$$\text{Volumen } (m^3) = \frac{\text{Largo (cm)} \times \text{Ancho (cm)} \times \text{Alto (cm)}}{1,000,000}$$

### 2.3 Peso Facturable ($PF$)
El peso sobre el cual se calculan los costos corresponde al mayor valor entre el peso real de báscula y el peso volumétrico:
$$\text{Peso Facturable (kg)} = \max(\text{Peso Real (kg)}, \text{Peso Volumétrico (kg)})$$

### 2.4 Costo Total del Envío
A partir de la tarifa seleccionada para el tipo de carga:
$$\text{Costo Total (Q)} = \text{Precio Base} + (PF \times \text{Precio por kg}) + (V \times \text{Precio por } m^3) + \text{Recargo}$$

---

## 3. Ejemplo Demostrativo Paso a Paso

Supongamos el registro de un paquete de carga estándar con los siguientes parámetros:
- **Dimensiones:** Largo = $50\text{ cm}$, Ancho = $40\text{ cm}$, Alto = $30\text{ cm}$
- **Peso Báscula:** $8.00\text{ kg}$
- **Tarifa Seleccionada:** Carga Estándar
  - Precio Base: $\text{Q } 25.00$
  - Precio por kg: $\text{Q } 5.00$
  - Precio por $m^3$: $\text{Q } 150.00$
  - Recargo por tipo de carga: $\text{Q } 10.00$

### Paso 1: Cálculo del Peso Volumétrico
$$PV = \frac{50 \times 40 \times 30}{5000} = \frac{60,000}{5000} = 12.00\text{ kg}$$

### Paso 2: Cálculo del Volumen
$$V = \frac{60,000}{1,000,000} = 0.06\text{ }m^3$$

### Paso 3: Determinación del Peso Facturable
$$PF = \max(8.00, 12.00) = 12.00\text{ kg} \quad \text{(Aplica el peso volumétrico)}$$

### Paso 4: Desglose de Costos
$$\begin{aligned}
\text{Costo Base:} & \quad \text{Q } 25.00 \\
\text{Costo por Peso:} & \quad 12.00 \times 5.00 = \text{Q } 60.00 \\
\text{Costo por Volumen:} & \quad 0.06 \times 150.00 = \text{Q } 9.00 \\
\text{Recargos:} & \quad \text{Q } 10.00 \\
\hline
\mathbf{\text{Total a Cobrar:}} & \quad \mathbf{\text{Q } 104.00}
\end{aligned}$$

---

## 4. Comportamiento Reactivo en la Interfaz (`GuiasPage.tsx`)

En el formulario de emisión de guías:
1. Conforme el operador digita el largo, ancho, alto o peso báscula, los valores de $PV$, $PF$, volumen y total en Quetzales se actualizan instantáneamente sin recargar la página.
2. Si el peso volumétrico supera al peso real, se muestra una etiqueta distintiva:
   `"Facturable por volumen: 12.00 kg"`.
3. Todos los importes monetarios se formatean con el símbolo oficial de la moneda guatemalteca (`Q`) y dos decimales fijos (`tabular-nums`).
