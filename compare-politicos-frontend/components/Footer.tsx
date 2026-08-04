import Link from 'next/link';
import { House, Scale, Users } from 'lucide-react';

const quickLinks = [
  { label: 'Home', href: '/', icon: House },
  { label: 'Deputados', href: '/deputados', icon: Users },
  { label: 'Compare', href: '/comparar', icon: Scale }
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.5fr_0.8fr] lg:px-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Compare Politicos</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Dados públicos, navegação simples e comparações pensadas para leitura rápida.
          </p>
          <blockquote className="mt-3 max-w-2xl border-l-2 border-emerald-200 pl-4 text-sm leading-6 text-slate-600">
            Este é um projeto independente, desenvolvido com o objetivo de facilitar o acesso a dados públicos.
          </blockquote>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:justify-self-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Links úteis</p>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.label}>
                    <Link href={item.href} className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[#25384d]">
                      <Icon className="size-4 text-slate-400" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Projeto</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Versão inicial do portal.<br></br> Apoie-nos para evoluir com novas integrações, indicadores e recursos de comparação.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}