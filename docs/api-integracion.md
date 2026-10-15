# Especificación de Integración de API — UMG Express Frontend

**Universidad Mariano Gálvez de Guatemala (UMG)**  
**Proyecto Académico — Sistema de Gestión Logística y Paquetería**

---

## 1. Convenciones de Comunicación

El frontend se comunica con el servidor **UMG Express C++17 Crow** a través de una API RESTful estructurada en formato JSON:

* **Configuración Dinámica de Entornos (`.env`):**
  * **Producción (Render Cloud):**
    ```env
    VITE_API_URL=https://umg-express.onrender.com/v1
    ```
  * **Desarrollo (Local C++ Crow en puerto 18080):**
    ```env
    VITE_API_URL=/v1
    VITE_PROXY_TARGET=http://127.0.0.1:18080
    ```
* **Base URL Resolutiva:** `getApiBaseUrl()` en `src/api/client.ts` detecta automáticamente si se está usando una URL de nube (`onrender.com`) o el proxy local para evitar bloqueos por CORS en el navegador.
* **Content-Type:** `application/json` en todas las solicitudes con cuerpo.
* **Esquema de Autorización:**
  ```http
  Authorization: Bearer <access_token>
  ```
  El token de sesión corresponde a una cadena hexadecimal de 64 caracteres (256 bits) generada por el backend.

---

## 2. Formato Unificado de Respuestas

Todas las respuestas del backend son deserializadas y procesadas por la capa `src/api/` bajo el siguiente estándar:

### Respuesta Exitosa (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "mensaje": "Operación completada exitosamente",
  "data": { ... } // o arreglo [...]
}
```

### Respuesta de Error (`400`, `401`, `403`, `404`, `409`)
```json
{
  "success": false,
  "error": "Descripción detallada del motivo de error",
  "mensaje": "Mensaje legible para el usuario"
}
```

---

## 3. Catálogo de Servicios del Frontend

La comunicación HTTP se organiza en módulos de servicio desacoplados dentro de `src/api/`:

### 3.1 Autenticación (`src/api/auth.ts`)
* `login(credentials: LoginCredentials): Promise<AuthResponse>`
  * **Endpoint:** `POST /v1/auth/login`
  * **Payload:** `{ username, password }`
  * **Retorno:** Token Bearer, vigencia en segundos y objeto `user` con rol y datos.
* `getUsuarios(): Promise<Usuario[]>`
  * **Endpoint:** `GET /v1/auth/usuarios` (Requiere rol `Administrador`)
* `crearUsuario(data: Partial<Usuario>): Promise<Usuario>`
  * **Endpoint:** `POST /v1/auth/usuarios` (Requiere rol `Administrador`)

### 3.2 Catálogos Maestros (`src/api/catalogos.ts`)
El frontend provee funciones CRUD uniformes para cada entidad:
* **Sucursales:**
  * `getSucursales()` -> `GET /v1/sucursales`
  * `crearSucursal(data)` -> `POST /v1/sucursales`
  * `actualizarSucursal(id, data)` -> `PUT /v1/sucursales/:id`
  * `eliminarSucursal(id)` -> `DELETE /v1/sucursales/:id` (Baja lógica)
* **Clientes:**
  * `getClientes()` -> `GET /v1/clientes`
  * `crearCliente(data)` -> `POST /v1/clientes`
  * `actualizarCliente(id, data)` -> `PUT /v1/clientes/:id`
  * `eliminarCliente(id)` -> `DELETE /v1/clientes/:id` (Baja lógica)
* **Rutas:**
  * `getRutas()` -> `GET /v1/rutas`
  * `crearRuta(data)` -> `POST /v1/rutas`
  * `actualizarRuta(id, data)` -> `PUT /v1/rutas/:id`
  * `eliminarRuta(id)` -> `DELETE /v1/rutas/:id`
* **Vehículos:**
  * `getVehiculos()` -> `GET /v1/vehiculos`
  * `crearVehiculo(data)` -> `POST /v1/vehiculos`
  * `actualizarVehiculo(id, data)` -> `PUT /v1/vehiculos/:id`
  * `eliminarVehiculo(id)` -> `DELETE /v1/vehiculos/:id`
* **Pilotos:**
  * `getPilotos()` -> `GET /v1/pilotos`
  * `crearPiloto(data)` -> `POST /v1/pilotos`
  * `actualizarPiloto(id, data)` -> `PUT /v1/pilotos/:id`
  * `eliminarPiloto(id)` -> `DELETE /v1/pilotos/:id`
* **Tarifas:**
  * `getTarifas()` -> `GET /v1/tarifas`
  * `crearTarifa(data)` -> `POST /v1/tarifas`
  * `actualizarTarifa(id, data)` -> `PUT /v1/tarifas/:id`
  * `eliminarTarifa(id)` -> `DELETE /v1/tarifas/:id`

### 3.3 Operaciones y Transacciones (`src/api/guias.ts` y `src/api/despacho.ts`)
* `getGuias(): Promise<Guia[]>` -> `GET /v1/guias`
* `crearGuia(data: CreateGuiaInput): Promise<Guia>` -> `POST /v1/guias`
  * Genera nuevo correlativo (1001+) y calcula pesos/costos.
* `getGuiaByNumero(numero: number): Promise<Guia>` -> `GET /v1/guias/:numero`
* `getDespachos(): Promise<Despacho[]>` -> `GET /v1/despachos`
* `crearDespacho(data: CreateDespachoInput): Promise<Despacho>` -> `POST /v1/despachos`
  * Asigna vehículo, piloto, ruta y lista de números de guía.

### 3.4 Reportes Especializados (`src/api/reportes.ts`)
* `getRastreo(numeroGuia: number): Promise<RastreoReporte>` -> `GET /v1/reportes/rastreo/:numeroGuia`
* `getManifiesto(vehiculoId: number): Promise<ManifiestoReporte>` -> `GET /v1/reportes/manifiesto/:vehiculoId`
* `getLiquidacion(): Promise<LiquidacionReporte>` -> `GET /v1/reportes/liquidacion`

---

## 4. Estrategia de Caché e Invalidación (TanStack Query)

El frontend utiliza llaves deterministas de consulta para garantizar que las listas y estadísticas se actualicen de inmediato tras cualquier acción operativa:

| Llave de Consulta (`queryKey`) | Acción Desencadenante de Invalidación |
| :--- | :--- |
| `['guias']` | Creación de una nueva guía o confirmación de despacho. |
| `['despachos']` | Ejecución exitosa de un despacho vehicular. |
| `['vehiculos']` | Alta, modificación, baja o despacho (cambio a "En ruta"). |
| `['sucursales']` | Creación o baja lógica de sucursales. |
| `['clientes']` | Alta o modificación de clientes por NIT. |
| `['pilotos']` | Modificación o asignación de pilotos. |
| `['tarifas']` | Actualización de tarifas por tipo de carga. |
| `['liquidacion']` | Emisión de nuevas guías o despachos realizados. |

Ejemplo de invalidación en mutación:
```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: crearDespacho,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['despachos'] });
    queryClient.invalidateQueries({ queryKey: ['guias'] });
    queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    toast.success('Vehículo despachado exitosamente');
  },
  onError: (err: any) => {
    toast.error(err.response?.data?.mensaje || 'Error al despachar vehículo');
  }
});
```

---

## 5. Manejo Centralizado de Errores HTTP

El interceptor en `src/api/client.ts` procesa las respuestas del backend:
1. **`401 Unauthorized`:** Se limpia el token y el usuario en el `authStore`, redireccionando a `/login` con un mensaje de expiración de sesión.
2. **`403 Forbidden`:** Se notifica que el rol activo no cuenta con privilegios para la acción solicitada.
3. **`409 Conflict`:** Se notifica duplicidad de clave única (e.g., "Ya existe un cliente con el NIT especificado").
4. **`400 Bad Request`:** Se extrae el mensaje de validación del backend (e.g., "El vehículo excede su capacidad física de peso o volumen").


---

## 6. Endpoints de Transacciones — Ciclo de Vida de Guías

El backend C++17 Crow implementa operaciones REST para el ciclo de vida y entrega de paquetería:

### 6.1 Actualización de Estado Operativo
* **Ruta:** `PUT /v1/transacciones/guias/{numeroGuia}` (admite también `PATCH`)
* **Roles Autorizados:** `Administrador`, `Operador`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Payload:**
  ```json
  {
    "estado": "Entregada" // Valores permitidos: "Creada" | "Despachada" | "Entregada"
  }
  ```
* **Respuesta (`200 OK`):**
  ```json
  {
    "success": true,
    "mensaje": "Estado de guía actualizado exitosamente a 'Entregada'",
    "guia": {
      "numeroGuia": 1001,
      "estado": "Entregada",
      "idClienteRemitente": 2,
      "idClienteDestinatario": 3,
      "idRuta": 2,
      "pesoRealKg": 12.5,
      "costoTotal": 45.45
    }
  }
  ```

### 6.2 Acción Directa de Entrega de Paquete
* **Ruta:** `POST /v1/transacciones/guias/{numeroGuia}/entregar`
* **Roles Autorizados:** `Administrador`, `Operador`
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta (`200 OK`):**
  ```json
  {
    "success": true,
    "mensaje": "Guía marcada como entregada exitosamente",
    "guia": {
      "numeroGuia": 1001,
      "estado": "Entregada"
    }
  }
  ```
