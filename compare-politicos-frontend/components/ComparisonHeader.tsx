import Image from 'next/image';
import { Building2, MapPin, UserCircle2, X } from 'lucide-react';
import type { Deputado } from '@/types/deputado';

interface ComparisonHeaderProps {
  selectedDeputados: Deputado[];
  onRemove: (id: number) => void;
}

interface SlotCardProps {
  deputado?: Deputado;
  onRemove: (id: number) => void;
}

function SlotCard({ deputado, onRemove }: SlotCardProps) {
  if (!deputado) {
    return (
      <article className="grid min-h-[124px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-center">
        <p className="text-sm font-medium text-slate-500">Pesquise outro deputado para comparar</p>
      </article>
    );
  }

  const hasPhoto = Boolean(deputado.url_foto);

  return (
    <article className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => onRemove(deputado.id)}
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
    </article>
  );
}

export function ComparisonHeader({ selectedDeputados, onRemove }: ComparisonHeaderProps) {
  const isSticky = selectedDeputados.length === 2;

  if (selectedDeputados.length === 0) {
    return null;
  }

  return (
    <section className={isSticky ? 'sticky top-20 z-30 mb-6' : 'mb-6'}>
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SlotCard deputado={selectedDeputados[0]} onRemove={onRemove} />
          <SlotCard deputado={selectedDeputados[1]} onRemove={onRemove} />
        </div>
      </div>
    </section>
  );
}