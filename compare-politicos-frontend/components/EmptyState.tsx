import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#c8d5e2] bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-[#edf3f8] text-[#567188]">
        <Inbox className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[#25384d]">Nenhum deputado encontrado</h3>
      <p className="text-sm text-slate-600">
        {hasFilters
          ? 'Ajuste os filtros ou o termo de busca para encontrar mais resultados.'
          : 'Nao ha dados disponiveis no momento.'}
      </p>
    </div>
  );
}
