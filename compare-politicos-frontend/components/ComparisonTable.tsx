import type { Deputado } from '@/types/deputado';
import type { ComparisonMetric, DespesaResumo } from '@/types/comparison';

interface ComparisonTableProps {
  selectedDeputados: Deputado[];
  despesasByDeputado: Record<number, DespesaResumo>;
}

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

interface MetricRow extends ComparisonMetric {
  compareKey?: keyof DespesaResumo;
  renderMode?: 'default' | 'fornecedor';
}

interface MetricGroup {
  id: 'resumo-financeiro' | 'comportamento-gasto';
  title: string;
  description: string;
  rows: MetricRow[];
}

const METRIC_GROUPS: MetricGroup[] = [
  {
    id: 'resumo-financeiro',
    title: 'Resumo Financeiro',
    description: 'Indicadores gerais de volume e intensidade de gasto.',
    rows: [
      {
        label: 'Gasto Total Acumulado',
        key: 'gastoTotalAcumulado',
        isCurrency: true,
        lowerIsBetter: true,
        group: 'resumo-financeiro'
      },
      {
        label: 'Maior Despesa Unica',
        key: 'maiorDespesaUnica',
        isCurrency: true,
        lowerIsBetter: true,
        group: 'resumo-financeiro'
      },
      {
        label: 'Gasto Medio Mensal',
        key: 'gastoMedioMensal',
        isCurrency: true,
        lowerIsBetter: true,
        group: 'resumo-financeiro'
      },
      {
        label: 'Categoria que mais gastou',
        key: 'categoriaMaisGastou',
        group: 'resumo-financeiro'
      }
    ]
  },
  {
    id: 'comportamento-gasto',
    title: 'Comportamento de Gasto',
    description: 'Padroes de concentracao, divulgacao e uso ao longo do tempo.',
    rows: [
      {
        label: 'Maior Fornecedor',
        key: 'maiorFornecedorNome',
        compareKey: 'maiorFornecedorValorTotal',
        isCurrency: true,
        lowerIsBetter: true,
        renderMode: 'fornecedor',
        group: 'comportamento-gasto'
      },
      {
        label: 'Gasto com Divulgacao (Marketing)',
        key: 'gastoDivulgacaoMarketing',
        isCurrency: true,
        lowerIsBetter: true,
        group: 'comportamento-gasto'
      },
      {
        label: 'Volume de Notas Emitidas',
        key: 'volumeNotasEmitidas',
        lowerIsBetter: true,
        group: 'comportamento-gasto'
      },
      {
        label: 'Gastos aos Finais de Semana',
        key: 'gastosFinaisSemana',
        isCurrency: true,
        lowerIsBetter: true,
        group: 'comportamento-gasto'
      }
    ]
  }
];

function formatMetricValue(value: string | number, isCurrency?: boolean) {
  if (typeof value === 'number' && isCurrency) {
    return BRL_FORMATTER.format(value);
  }

  return String(value);
}

function renderFornecedorCell(resumo: DespesaResumo) {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-[#25384d]">{resumo.maiorFornecedorNome}</span>
      <span className="text-sm text-slate-600">{BRL_FORMATTER.format(resumo.maiorFornecedorValorTotal)}</span>
    </div>
  );
}

export function ComparisonTable({ selectedDeputados, despesasByDeputado }: ComparisonTableProps) {
  if (selectedDeputados.length < 2) {
    return null;
  }

  const deputadoA = selectedDeputados[0];
  const deputadoB = selectedDeputados[1];

  const resumoA = despesasByDeputado[deputadoA.id];
  const resumoB = despesasByDeputado[deputadoB.id];

  if (!resumoA || !resumoB) {
    return null;
  }

  return (
    <section aria-label="Tabela comparativa de despesas" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto rounded-2xl">
        <table className="min-w-180 w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/90">
              <th className="w-[32%] border-b border-slate-200 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Metrica
              </th>
              <th className="w-[34%] border-b border-slate-200 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                {deputadoA.nome}
              </th>
              <th className="w-[34%] border-b border-slate-200 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                {deputadoB.nome}
              </th>
            </tr>
          </thead>

          <tbody>
            {METRIC_GROUPS.flatMap((group) => {
              const sectionHeader = (
                <tr key={`${group.id}-header`} className="bg-slate-100/70">
                  <td colSpan={3} className="border-y border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">{group.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{group.description}</p>
                  </td>
                </tr>
              );

              const rows = group.rows.map((metric) => {
                const compareKey = metric.compareKey ?? metric.key;
                const displayValueA = resumoA[metric.key];
                const displayValueB = resumoB[metric.key];
                const comparableValueA = resumoA[compareKey];
                const comparableValueB = resumoB[compareKey];

                const canCompareAsNumber =
                  metric.lowerIsBetter && typeof comparableValueA === 'number' && typeof comparableValueB === 'number';

                const isTie = canCompareAsNumber ? comparableValueA === comparableValueB : false;

                const winnerA = canCompareAsNumber ? comparableValueA < comparableValueB : false;
                const winnerB = canCompareAsNumber ? comparableValueB < comparableValueA : false;

                const winnerClass = 'bg-emerald-50 font-semibold text-emerald-900';
                const tieBadge = (
                  <span className="ml-2 inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    Empate
                  </span>
                );

                return (
                  <tr key={metric.key} className="odd:bg-white even:bg-slate-50/35">
                    <td className="border-b border-slate-200 px-4 py-4 text-sm font-medium text-[#25384d]">{metric.label}</td>
                    <td className={`border-b border-slate-200 px-4 py-4 text-sm text-slate-700 ${winnerA ? winnerClass : ''}`}>
                      <div className="inline-flex items-center">
                        {metric.renderMode === 'fornecedor'
                          ? renderFornecedorCell(resumoA)
                          : formatMetricValue(displayValueA, metric.isCurrency)}
                        {isTie ? tieBadge : null}
                      </div>
                    </td>
                    <td className={`border-b border-slate-200 px-4 py-4 text-sm text-slate-700 ${winnerB ? winnerClass : ''}`}>
                      <div className="inline-flex items-center">
                        {metric.renderMode === 'fornecedor'
                          ? renderFornecedorCell(resumoB)
                          : formatMetricValue(displayValueB, metric.isCurrency)}
                        {isTie ? tieBadge : null}
                      </div>
                    </td>
                  </tr>
                );
              });

              return [sectionHeader, ...rows];
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}