import Image from 'next/image';
import { Building2, MapPin, UserCircle2 } from 'lucide-react';
import type { Deputado } from '@/types/deputado';

interface DeputadoCardProps {
  deputado: Deputado;
}

export function DeputadoCard({ deputado }: DeputadoCardProps) {
  const hasPhoto = Boolean(deputado.url_foto);

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-[#bfdccc] hover:shadow-lg">
      <div className="mb-4 flex justify-center">
        {hasPhoto ? (
          <Image
            src={deputado.url_foto}
            alt={`Foto de ${deputado.nome}`}
            width={80}
            height={80}
            unoptimized
            className="size-20 rounded-2xl border border-[#d7e1ea] object-cover"
          />
        ) : (
          <div className="grid size-20 place-items-center rounded-2xl border border-dashed border-[#c8d5e2] bg-[#eef3f8] text-[#7a8ea2]">
            <UserCircle2 className="size-8" aria-hidden="true" />
          </div>
        )}
      </div>

      <h3 className="line-clamp-2 min-h-12 text-center text-base font-semibold text-[#25384d]">{deputado.nome}</h3>

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#d4e0ea] bg-[#edf3f8] px-2.5 py-1 text-xs font-semibold text-[#334a63]">
          <Building2 className="size-3" aria-hidden="true" />
          {deputado.sigla_partido}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#ccefdc] bg-[#ecf9f2] px-2.5 py-1 text-xs font-semibold text-[#08b862]">
          <MapPin className="size-3" aria-hidden="true" />
          {deputado.sigla_uf}
        </span>
      </div>
    </article>
  );
}
