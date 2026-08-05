'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Building2, Hash, Link2, Mail, MapPin, Phone, Shield, UserCircle2, X } from 'lucide-react';
import type { Deputado } from '@/types/deputado';

interface DeputadoModalProps {
  deputado: Deputado | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeputadoModal({ deputado, isOpen, onClose }: DeputadoModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !deputado) {
    return null;
  }

  const hasPhoto = Boolean(deputado.url_foto);
  const hasContacts = Boolean(deputado.email || deputado.telefone);

  return (
    <div
      className="fixed inset-0 z-80 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deputado-modal-title"
    >
      <div
        className="w-full rounded-t-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#08b862]">Visualizacao Rapida</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar visualizacao rapida"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          {hasPhoto ? (
            <Image
              src={deputado.url_foto}
              alt={`Foto de ${deputado.nome}`}
              width={144}
              height={144}
              unoptimized
              className="size-36 rounded-full border-4 border-[#e3edf5] object-cover"
            />
          ) : (
            <div className="grid size-36 place-items-center rounded-full border border-dashed border-[#c8d5e2] bg-[#eef3f8] text-[#7a8ea2]">
              <UserCircle2 className="size-14" aria-hidden="true" />
            </div>
          )}

          <h3 id="deputado-modal-title" className="mt-4 text-2xl font-bold leading-tight text-[#25384d]">
            {deputado.nome}
          </h3>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d4e0ea] bg-[#edf3f8] px-3 py-1 text-xs font-semibold text-[#334a63]">
              <Building2 className="size-3" aria-hidden="true" />
              {deputado.sigla_partido}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#ccefdc] bg-[#ecf9f2] px-3 py-1 text-xs font-semibold text-[#08b862]">
              <MapPin className="size-3" aria-hidden="true" />
              {deputado.sigla_uf}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">Contato oficial</p>

          {hasContacts ? (
            <div className="space-y-2 text-sm text-slate-600">
              {deputado.email ? (
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-slate-400" aria-hidden="true" />
                  <span className="truncate">{deputado.email}</span>
                </p>
              ) : null}

              {deputado.telefone ? (
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-slate-400" aria-hidden="true" />
                  <span>{deputado.telefone}</span>
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sem contatos disponiveis no momento.</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Identificacao</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Hash className="size-4 text-slate-400" aria-hidden="true" />
              ID {deputado.id}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Legislatura</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Shield className="size-4 text-slate-400" aria-hidden="true" />
              {deputado.id_legislatura ? `N ${deputado.id_legislatura}` : 'Nao informado'}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Perfil na API da Camara</p>

          {deputado.uri ? (
            <a
              href={deputado.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0d8f52] underline decoration-[#bde9d3] underline-offset-2 hover:text-[#0a7442]"
            >
              <Link2 className="size-4" aria-hidden="true" />
              Abrir perfil do parlamentar
            </a>
          ) : (
            <p className="text-sm text-slate-500">Link do perfil nao disponivel.</p>
          )}
        </div>
      </div>
    </div>
  );
}