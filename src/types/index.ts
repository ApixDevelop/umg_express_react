export type UserRole = "Administrador" | "Operador" | "Auditor";

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: UserRole;
}

export interface LoginResponse {
  success: boolean;
  mensaje?: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: Usuario;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Cliente {
  id: number;
  nit: string;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Ruta {
  id: number;
  idSucursalOrigen: number;
  idSucursalDestino: number;
  distanciaKm: number;
  tarifaBase: number;
}

export type EstadoVehiculo = "Disponible" | "En ruta" | "En taller";

export interface Vehiculo {
  id: number;
  placa: string;
  marcaModelo: string;
  capacidadPesoKg: number;
  capacidadVolumenM3: number;
  estado: EstadoVehiculo;
}

export interface Piloto {
  id: number;
  nombre: string;
  licencia: string;
  telefono: string;
}

export interface Tarifa {
  id: number;
  tipoCarga: string;
  precioPorKg: number;
  precioPorM3: number;
  recargoEspecial: number;
}

export type EstadoGuia = "Creada" | "Despachada" | "Entregada";

export interface Guia {
  numeroGuia: number;
  idClienteRemitente: number;
  idClienteDestinatario: number;
  idRuta: number;
  pesoRealKg: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  pesoVolumetricoKg: number;
  pesoFacturableKg: number;
  costoTotal: number;
  estado: EstadoGuia;
}

export interface DespachoItem {
  id: number;
  idVehiculo: number;
  idPiloto: number;
  numeroGuia: number;
  pesoKg: number;
  volumenM3: number;
  fechaDespacho: string;
}

export interface ResultadoDespacho {
  idVehiculo: number;
  idPiloto: number;
  totalGuias: number;
  pesoTotalKg: number;
  volumenTotalM3: number;
  estadoVehiculo: string;
  guiasDespachadas: number[];
}

export interface RastreoInfo {
  numeroGuia: number;
  estado: EstadoGuia;
  paquete: {
    pesoRealKg: number;
    largoCm: number;
    anchoCm: number;
    altoCm: number;
    pesoVolumetricoKg: number;
    pesoFacturableKg: number;
    costoTotal: number;
  };
  remitente?: {
    id: number;
    nit: string;
    nombre: string;
    direccion: string;
    telefono: string;
  };
  destinatario?: {
    id: number;
    nit: string;
    nombre: string;
    direccion: string;
    telefono: string;
  };
  ruta?: {
    id: number;
    distanciaKm: number;
    tarifaBase: number;
    origen?: { id: number; nombre: string; direccion: string; telefono: string };
    destino?: { id: number; nombre: string; direccion: string; telefono: string };
  };
  despacho?: {
    despachada: boolean;
    fechaDespacho?: string;
    vehiculo?: { id: number; placa: string; marcaModelo: string; estado: string };
    piloto?: { id: number; nombre: string; licencia: string; telefono: string };
  };
}

export interface ManifiestoGuia {
  numeroGuia: number;
  estado: string;
  pesoRealKg: number;
  pesoVolumetricoKg: number;
  pesoFacturableKg: number;
  volumenM3: number;
  costoTotal: number;
  remitente?: { id: number; nombre: string };
  destinatario?: { id: number; nombre: string };
}

export interface ManifiestoInfo {
  vehiculo: {
    id: number;
    placa: string;
    marcaModelo: string;
    capacidadPesoKg: number;
    capacidadVolumenM3: number;
    estado: string;
  };
  piloto: {
    id: number;
    nombre: string;
    licencia: string;
    telefono: string;
  } | null;
  ruta: {
    id: number;
    sucursalOrigen?: { id: number; nombre: string; direccion: string };
    sucursalDestino?: { id: number; nombre: string; direccion: string };
  } | null;
  resumen: {
    totalGuias: number;
    pesoTotalKg: number;
    volumenTotalM3: number;
  };
  guias: ManifiestoGuia[];
}

export interface LiquidacionInfo {
  resumenFinanciero: {
    totalGuiasConsideradas: number;
    totalGuiasInactivas: number;
    importeTotalFacturado: number;
    cobradoConfirmado: number;
  };
  guiasPorEstado: Array<{
    estado: string;
    cantidadGuias: number;
    importeTotal: number;
  }>;
  resumenPorRuta: Array<{
    idRuta: number;
    cantidadGuias: number;
    importeTotal: number;
  }>;
  resumenPorSucursalOrigen: Array<{
    idSucursal: number;
    nombre: string;
    cantidadGuias: number;
    importeTotal: number;
  }>;
  desgloseGuias: Array<{
    numeroGuia: number;
    estado: string;
    pesoFacturableKg: number;
    costoTotal: number;
    idClienteRemitente: number;
    idClienteDestinatario: number;
    idRuta: number;
    sucursalOrigen?: string;
  }>;
}

export interface ApiHealthResponse {
  status: string;
  servicio?: string;
  modulo_auth?: string;
  modulo_catalogos?: string;
  modulo_guias?: string;
}
