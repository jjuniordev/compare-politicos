export interface DespesaResumo {
  gastoTotalAcumulado: number;
  maiorDespesaUnica: number;
  gastoMedioMensal: number;
  categoriaMaisGastou: string;
  maiorFornecedorNome: string;
  maiorFornecedorValorTotal: number;
  gastoDivulgacaoMarketing: number;
  volumeNotasEmitidas: number;
  gastosFinaisSemana: number;
}

export interface ComparisonMetric {
  label: string;
  key: keyof DespesaResumo;
  isCurrency?: boolean;
  lowerIsBetter?: boolean;
  group?: 'resumo-financeiro' | 'comportamento-gasto';
}

export interface DespesaResumoResponse {
  success: boolean;
  data: DespesaResumo;
  message?: string;
}