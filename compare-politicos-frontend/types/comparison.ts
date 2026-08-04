export interface DespesaResumo {
  gastoTotalAcumulado: number;
  maiorDespesaUnica: number;
  gastoMedioMensal: number;
  categoriaMaisGastou: string;
}

export interface ComparisonMetric {
  label: string;
  key: keyof DespesaResumo;
  isCurrency?: boolean;
  lowerIsBetter?: boolean;
}

export interface DespesaResumoResponse {
  success: boolean;
  data: DespesaResumo;
  message?: string;
}