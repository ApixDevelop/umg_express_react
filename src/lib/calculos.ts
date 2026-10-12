export function calcularPesoVolumetrico(largoCm: number, anchoCm: number, altoCm: number): number {
  if (largoCm <= 0 || anchoCm <= 0 || altoCm <= 0) return 0;
  return Number(((largoCm * anchoCm * altoCm) / 5000).toFixed(2));
}

export function calcularVolumenM3(largoCm: number, anchoCm: number, altoCm: number): number {
  if (largoCm <= 0 || anchoCm <= 0 || altoCm <= 0) return 0;
  return Number(((largoCm * anchoCm * altoCm) / 1000000).toFixed(4));
}

export function calcularPesoFacturable(pesoRealKg: number, pesoVolumetricoKg: number): number {
  return Number(Math.max(pesoRealKg || 0, pesoVolumetricoKg || 0).toFixed(2));
}

export function calcularCostoEstimado(
  tarifaBaseRuta: number,
  pesoFacturableKg: number,
  volumenM3: number,
  tarifa?: { precioPorKg: number; precioPorM3: number; recargoEspecial: number } | null
): number {
  let costo = tarifaBaseRuta || 0;
  if (tarifa) {
    costo += (pesoFacturableKg * (tarifa.precioPorKg || 0));
    costo += (volumenM3 * (tarifa.precioPorM3 || 0));
    costo += (tarifa.recargoEspecial || 0);
  } else {
    costo += (pesoFacturableKg * 10.0);
  }
  return Number(costo.toFixed(2));
}
