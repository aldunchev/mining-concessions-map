export interface Deposit {
  id: string;
  koncesioner: string;
  nahodishte: string;
  obshtina: string;
  oblast: string;
  grupa_bogatstvo: string;
  vid_bogatstvo: string;
  srok_koncesiya: string;
  status: string;
  coordinates: [number, number] | null;
  coordinate_confidence: 'high' | 'medium' | 'low' | 'none';
}

export interface DepositsData {
  metadata: {
    total_deposits: number;
    geocoded_deposits: number;
    success_rate: number;
    confidence_distribution: {
      high: number;
      medium: number;
      low: number;
      none: number;
    };
    extraction_date: string;
    source_file: string;
  };
  deposits: Deposit[];
}

export interface MapFilters {
  search: string;
  oblast: string[];
  mineralType: string[];
  status: string[];
  confidence: string[];
}

export interface MapConfig {
  center: google.maps.LatLngLiteral;
  zoom: number;
  mapTypeId: google.maps.MapTypeId;
  styles?: google.maps.MapTypeStyle[];
}

export type MineralGroup = 
  | 'Метални полезни изкопаеми'
  | 'Индустриални минерали'
  | 'Строителни материали'
  | 'Скално-облицовъчни материали'
  | 'Твърди горива'
  | string;

export const STATUS_COLORS: Record<string, string> = {
  'съгласуван': '#22c55e',
  'процедура по съгласуване': '#f59e0b',
  'договорът не е влязъл в сила': '#ef4444',
  'default': '#6b7280'
};

export const MINERAL_COLORS: Record<string, string> = {
  'Варовици': '#94a3b8',
  'Пясъци и чакъли': '#fbbf24',
  'Мрамори': '#f472b6',
  'Гнайси': '#a78bfa',
  'Базалти': '#4b5563',
  'Андезити': '#84cc16',
  'Медни руди': '#fb923c',
  'Златно-сребърни руди': '#fde047',
  'default': '#6b7280'
};