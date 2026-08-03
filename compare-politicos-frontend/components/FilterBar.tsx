import { ListFilter, Search } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  selectedUf: string;
  selectedPartido: string;
  ufs: string[];
  partidos: string[];
  total: number;
  filteredTotal: number;
  onSearchChange: (value: string) => void;
  onUfChange: (value: string) => void;
  onPartidoChange: (value: string) => void;
}

export function FilterBar({
  searchTerm,
  selectedUf,
  selectedPartido,
  ufs,
  partidos,
  total,
  filteredTotal,
  onSearchChange,
  onUfChange,
  onPartidoChange
}: FilterBarProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d2e4da] bg-[#ecf8f1] px-3 py-1.5 font-medium text-[#25384d]">
          <ListFilter className="size-4" aria-hidden="true" />
          Filtros ativos
        </div>
        <p>
          Exibindo <span className="font-semibold text-[#25384d]">{filteredTotal}</span> de{' '}
          <span className="font-semibold text-[#25384d]">{total}</span> deputados
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <label className="relative md:col-span-6">
          <span className="sr-only">Buscar por nome</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar parlamentar por nome"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-[#25384d] outline-none transition focus:border-[#10c96f] focus:ring-2 focus:ring-[#d8f5e7]"
          />
        </label>

        <label className="md:col-span-3">
          <span className="sr-only">Filtrar por estado</span>
          <select
            value={selectedUf}
            onChange={(event) => onUfChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#25384d] outline-none transition focus:border-[#10c96f] focus:ring-2 focus:ring-[#d8f5e7]"
          >
            <option value="">Todos os estados</option>
            {ufs.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </label>

        <label className="md:col-span-3">
          <span className="sr-only">Filtrar por partido</span>
          <select
            value={selectedPartido}
            onChange={(event) => onPartidoChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#25384d] outline-none transition focus:border-[#10c96f] focus:ring-2 focus:ring-[#d8f5e7]"
          >
            <option value="">Todos os partidos</option>
            {partidos.map((partido) => (
              <option key={partido} value={partido}>
                {partido}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
