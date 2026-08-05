import Image from 'next/image';
import { Building2, MapPin, UserCircle2, X } from 'lucide-react';
import { AutocompleteSearch } from '@/components/AutocompleteSearch';
import type { Deputado } from '@/types/deputado';

interface ComparisonHeaderProps {
  deputados: Deputado[];
  selectedDeputados: Array<Deputado | null>;
  onSelect: (slotIndex: number, deputado: Deputado) => void;
  onRemove: (slotIndex: number) => void;
  loading?: boolean;
}

interface SlotCardProps {
  slotIndex: number;
  deputados: Deputado[];
  deputado?: Deputado;
  excludedDeputadoIds: number[];
  onSelect: (slotIndex: number, deputado: Deputado) => void;
  onRemove: (slotIndex: number) => void;
  loading?: boolean;
}

function SlotCard({ slotIndex, deputados, deputado, excludedDeputadoIds, onSelect, onRemove, loading = false }: SlotCardProps) {
  const slotLabel = `Deputado ${slotIndex + 1}`;
  const hasDeputado = Boolean(deputado);
  const hasPhoto = Boolean(deputado?.url_foto);

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition ${
        hasDeputado ? 'border-slate-200 bg-white' : 'border-dashed border-slate-300 bg-white/60'
      }`}
    >
      <AutocompleteSearch
        deputados={deputados}
        excludedDeputadoIds={excludedDeputadoIds}
        onSelect={(selectedDeputado) => onSelect(slotIndex, selectedDeputado)}
        loading={loading}
        inputId={`comparar-slot-${slotIndex}`}
        label={`${slotLabel} - Buscar parlamentar`}
        placeholder="Digite o nome do deputado"
      />

      {!hasDeputado ? (
        <div className="mt-3 grid min-h-31 place-items-center rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-6 text-center">
          <p className="text-sm font-medium text-slate-500">Selecione um parlamentar para preencher este card</p>
        </div>
      ) : null}

      {deputado ? (
        <div className="relative mt-3 rounded-xl border border-slate-200 bg-white p-4">
          <button
            type="button"
            onClick={() => onRemove(slotIndex)}
            className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label={`Remover ${deputado.nome} da comparacao`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            {hasPhoto ? (
              <Image
                src={deputado.url_foto}
                alt={`Foto de ${deputado.nome}`}
                width={64}
                height={64}
                unoptimized
                className="size-16 rounded-full border border-[#d7e1ea] object-cover"
              />
            ) : (
              <div className="grid size-16 place-items-center rounded-full border border-dashed border-[#c8d5e2] bg-[#eef3f8] text-[#7a8ea2]">
                <UserCircle2 className="size-7" aria-hidden="true" />
              </div>
            )}

            <div>
              <h3 className="line-clamp-2 text-base font-semibold text-[#25384d]">{deputado.nome}</h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#d4e0ea] bg-[#edf3f8] px-2.5 py-1 text-xs font-semibold text-[#334a63]">
                  <Building2 className="size-3" aria-hidden="true" />
                  {deputado.sigla_partido}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#ccefdc] bg-[#ecf9f2] px-2.5 py-1 text-xs font-semibold text-[#08b862]">
                  <MapPin className="size-3" aria-hidden="true" />
                  {deputado.sigla_uf}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function ComparisonHeader({ deputados, selectedDeputados, onSelect, onRemove, loading = false }: ComparisonHeaderProps) {
  const firstSelected = selectedDeputados[0] ?? undefined;
  const secondSelected = selectedDeputados[1] ?? undefined;
  const firstExcluded = secondSelected ? [secondSelected.id] : [];
  const secondExcluded = firstSelected ? [firstSelected.id] : [];

  return (
    <section className="mb-6">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SlotCard
            slotIndex={0}
            deputados={deputados}
            deputado={firstSelected}
            excludedDeputadoIds={firstExcluded}
            onSelect={onSelect}
            onRemove={onRemove}
            loading={loading}
          />
          <SlotCard
            slotIndex={1}
            deputados={deputados}
            deputado={secondSelected}
            excludedDeputadoIds={secondExcluded}
            onSelect={onSelect}
            onRemove={onRemove}
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
}