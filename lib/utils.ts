import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Deposit, MapFilters, MINERAL_COLORS, STATUS_COLORS } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMarkerColor(deposit: Deposit): string {
  // First try to get color by mineral type
  const mineralColor = MINERAL_COLORS[deposit.vid_bogatstvo];
  if (mineralColor) return mineralColor;
  
  // Otherwise use status color
  const statusColor = STATUS_COLORS[deposit.status];
  return statusColor || STATUS_COLORS.default;
}

export function filterDeposits(deposits: Deposit[], filters: MapFilters): Deposit[] {
  return deposits.filter(deposit => {
    // Skip invalid deposits
    if (!deposit.coordinates || deposit.id.includes("Идентифика")) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableFields = [
        deposit.nahodishte,
        deposit.koncesioner,
        deposit.obshtina,
        deposit.oblast,
        deposit.vid_bogatstvo
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableFields.includes(searchLower)) return false;
    }
    
    // Oblast filter
    if (filters.oblast.length > 0 && !filters.oblast.includes(deposit.oblast)) {
      return false;
    }
    
    // Mineral type filter
    if (filters.mineralType.length > 0 && !filters.mineralType.includes(deposit.vid_bogatstvo)) {
      return false;
    }
    
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(deposit.status)) {
      return false;
    }
    
    // Confidence filter
    if (filters.confidence.length > 0 && !filters.confidence.includes(deposit.coordinate_confidence)) {
      return false;
    }
    
    return true;
  });
}

export function getUniqueValues(deposits: Deposit[], field: keyof Deposit): string[] {
  const values = new Set<string>();
  deposits.forEach(deposit => {
    const value = deposit[field];
    if (value && typeof value === 'string' && value.trim()) {
      values.add(value);
    }
  });
  return Array.from(values).sort();
}

export function calculateStatistics(deposits: Deposit[]) {
  const validDeposits = deposits.filter(d => d.coordinates && !d.id.includes("Идентифика"));
  
  const byOblast = validDeposits.reduce((acc, deposit) => {
    acc[deposit.oblast] = (acc[deposit.oblast] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byMineralType = validDeposits.reduce((acc, deposit) => {
    const type = deposit.vid_bogatstvo || 'Неизвестен';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byStatus = validDeposits.reduce((acc, deposit) => {
    acc[deposit.status] = (acc[deposit.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: validDeposits.length,
    byOblast,
    byMineralType,
    byStatus
  };
}

// Bulgaria center coordinates
export const BULGARIA_CENTER = {
  lat: 42.7339,
  lng: 25.4858
};

// Map styles for better visualization
export const mapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  }
];