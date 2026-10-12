import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "Q 0.00";
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace("GTQ", "Q");
}

export function formatNumber(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) return "0.00";
  return Number(val).toFixed(decimals);
}

export function formatWeight(kg: number | null | undefined): string {
  return `${formatNumber(kg)} kg`;
}

export function formatVolume(m3: number | null | undefined): string {
  return `${formatNumber(m3, 3)} m³`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  return dateStr;
}
