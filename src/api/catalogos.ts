import { api } from "./client";
import type {
  Sucursal,
  Cliente,
  Ruta,
  Vehiculo,
  Piloto,
  Tarifa,
} from "@/types";

export const sucursalesApi = {
  async listar(): Promise<Sucursal[]> {
    const res = await api.get<{ success: boolean; sucursales: Sucursal[] }>("/sucursales");
    return res.data.sucursales || [];
  },
  async obtener(id: number): Promise<Sucursal> {
    const res = await api.get<{ success: boolean; sucursal: Sucursal }>(`/sucursales/${id}`);
    return res.data.sucursal;
  },
  async crear(data: Omit<Sucursal, "id">): Promise<Sucursal> {
    const res = await api.post<{ success: boolean; sucursal: Sucursal }>("/sucursales", data);
    return res.data.sucursal;
  },
  async actualizar(id: number, data: Omit<Sucursal, "id">): Promise<Sucursal> {
    const res = await api.put<{ success: boolean; sucursal: Sucursal }>(`/sucursales/${id}`, data);
    return res.data.sucursal;
  },
  async eliminar(id: number): Promise<void> {
    await api.delete(`/sucursales/${id}`);
  },
};

export const clientesApi = {
  async listar(): Promise<Cliente[]> {
    const res = await api.get<{ success: boolean; clientes: Cliente[] }>("/clientes");
    return res.data.clientes || [];
  },
  async obtener(id: number): Promise<Cliente> {
    const res = await api.get<{ success: boolean; cliente: Cliente }>(`/clientes/${id}`);
    return res.data.cliente;
  },
  async crear(data: Omit<Cliente, "id">): Promise<Cliente> {
    const res = await api.post<{ success: boolean; cliente: Cliente }>("/clientes", data);
    return res.data.cliente;
  },
  async actualizar(id: number, data: Omit<Cliente, "id">): Promise<Cliente> {
    const res = await api.put<{ success: boolean; cliente: Cliente }>(`/clientes/${id}`, data);
    return res.data.cliente;
  },
  async eliminar(id: number): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },
};

export const rutasApi = {
  async listar(): Promise<Ruta[]> {
    const res = await api.get<{ success: boolean; rutas: Ruta[] }>("/rutas");
    return res.data.rutas || [];
  },
  async obtener(id: number): Promise<Ruta> {
    const res = await api.get<{ success: boolean; ruta: Ruta }>(`/rutas/${id}`);
    return res.data.ruta;
  },
  async crear(data: Omit<Ruta, "id">): Promise<Ruta> {
    const res = await api.post<{ success: boolean; ruta: Ruta }>("/rutas", data);
    return res.data.ruta;
  },
  async actualizar(id: number, data: Omit<Ruta, "id">): Promise<Ruta> {
    const res = await api.put<{ success: boolean; ruta: Ruta }>(`/rutas/${id}`, data);
    return res.data.ruta;
  },
  async eliminar(id: number): Promise<void> {
    await api.delete(`/rutas/${id}`);
  },
};

export const vehiculosApi = {
  async listar(): Promise<Vehiculo[]> {
    const res = await api.get<{ success: boolean; vehiculos: Vehiculo[] }>("/vehiculos");
    return res.data.vehiculos || [];
  },
  async obtener(id: number): Promise<Vehiculo> {
    const res = await api.get<{ success: boolean; vehiculo: Vehiculo }>(`/vehiculos/${id}`);
    return res.data.vehiculo;
  },
  async crear(data: Omit<Vehiculo, "id">): Promise<Vehiculo> {
    const res = await api.post<{ success: boolean; vehiculo: Vehiculo }>("/vehiculos", data);
    return res.data.vehiculo;
  },
  async actualizar(id: number, data: Omit<Vehiculo, "id">): Promise<Vehiculo> {
    const res = await api.put<{ success: boolean; vehiculo: Vehiculo }>(`/vehiculos/${id}`, data);
    return res.data.vehiculo;
  },
  async eliminar(id: number): Promise<void> {
    await api.delete(`/vehiculos/${id}`);
  },
};

export const pilotosApi = {
  async listar(): Promise<Piloto[]> {
    const res = await api.get<{ success: boolean; pilotos: Piloto[] }>("/pilotos");
    return res.data.pilotos || [];
  },
  async obtener(id: number): Promise<Piloto> {
    const res = await api.get<{ success: boolean; piloto: Piloto }>(`/pilotos/${id}`);
    return res.data.piloto;
  },
  async crear(data: Omit<Piloto, "id">): Promise<Piloto> {
    const res = await api.post<{ success: boolean; piloto: Piloto }>("/pilotos", data);
    return res.data.piloto;
  },
  async actualizar(id: number, data: Omit<Piloto, "id">): Promise<Piloto> {
    const res = await api.put<{ success: boolean; piloto: Piloto }>(`/pilotos/${id}`, data);
    return res.data.piloto;
  },
  async eliminar(id: number): Promise<void> {
    await api.delete(`/pilotos/${id}`);
  },
};

export const tarifasApi = {
  async listar(): Promise<Tarifa[]> {
    const res = await api.get<{ success: boolean; tarifas: Tarifa[] }>("/tarifas");
    return res.data.tarifas || [];
  },
  async obtener(id: number): Promise<Tarifa> {
    const res = await api.get<{ success: boolean; tarifa: Tarifa }>(`/tarifas/${id}`);
    return res.data.tarifa;
  },
  async crear(data: Omit<Tarifa, "id">): Promise<Tarifa> {
    const res = await api.post<{ success: boolean; tarifa: Tarifa }>("/tarifas", data);
    return res.data.tarifa;
  },
  async actualizar(id: number, data: Omit<Tarifa, "id">): Promise<Tarifa> {
    const res = await api.put<{ success: boolean; tarifa: Tarifa }>(`/tarifas/${id}`, data);
    return res.data.tarifa;
  },
  async eliminar(id: number): Promise<void> {
    await api.delete(`/tarifas/${id}`);
  },
};
