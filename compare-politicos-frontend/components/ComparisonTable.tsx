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

const METRICS: ComparisonMetric[] = [
  {
    label: 'Gasto Total Acumulado',
    key: 'gastoTotalAcumulado',
    isCurrency: true,
    lowerIsBetter: true
  },
  {
    label: 'Maior Despesa Unica',
    key: 'maiorDespesaUnica',
    isCurrency: true,
    lowerIsBetter: true
  },
  {
    label: 'Gasto Medio Mensal',
    key: 'gastoMedioMensal',
    isCurrency: true,
    lowerIsBetter: true
  },
  {
    label: 'Categoria que mais gastou',
    key: 'categoriaMaisGastou'
  }
];

function formatMetricValue(value: string | number, isCurrency?: boolean) {
  if (typeof value === 'number' && isCurrency) {
    return BRL_FORMATTER.format(value);
  }

  return String(value);
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
        <table className="min-w-[720px] w-full border-collapse">
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
            {METRICS.map((metric) => {
              const valueA = resumoA[metric.key];
              const valueB = resumoB[metric.key];

              const canCompareAsNumber =
                metric.lowerIsBetter && typeof valueA === 'number' && typeof valueB === 'number';

              const isTie = canCompareAsNumber ? valueA === valueB : false;

              const winnerA = canCompareAsNumber ? valueA < valueB : false;
              const winnerB = canCompareAsNumber ? valueB < valueA : false;

              const winnerClass = 'bg-emerald-50 font-semibold text-emerald-900';
              const tieBadge = (
                <span className="ml-2 inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  Empate
                </span>
              );

              return (
                <tr key={metric.key} className="odd:bg-white even:bg-slate-50/35">
                  <td className="border-b border-slate-200 px-4 py-4 text-sm font-medium text-[#25384d]">{metric.label}</td>
                  <td
                    className={`border-b border-slate-200 px-4 py-4 text-sm text-slate-700 ${winnerA ? winnerClass : ''}`}
                  >
                    <span className="inline-flex items-center">
                      {formatMetricValue(valueA, metric.isCurrency)}
                      {isTie ? tieBadge : null}
                    </span>
                  </td>
                  <td
                    className={`border-b border-slate-200 px-4 py-4 text-sm text-slate-700 ${winnerB ? winnerClass : ''}`}
                  >
                    <span className="inline-flex items-center">
                      {formatMetricValue(valueB, metric.isCurrency)}
                      {isTie ? tieBadge : null}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}