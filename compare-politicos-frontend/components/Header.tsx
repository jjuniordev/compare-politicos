"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BarChart3, ChevronDown, GraduationCap, Landmark, Scale, Sparkles } from 'lucide-react';

const deputadoLinks = [
  { label: 'Federais', href: '/deputados', icon: GraduationCap, disabled: false },
  { label: 'Estaduais', href: '#', icon: Landmark, disabled: true },
  { label: 'Senadores', href: '#', icon: Scale, disabled: true }
];

export function Header() {
  const pathname = usePathname();
  const [isDeputadosOpen, setIsDeputadosOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHomeIndicators = pathname === '/';
  const isDeputadosRoute = pathname === '/deputados';
  const isCompararRoute = pathname === '/comparar';

  const deputyTriggerClass = useMemo(() => {
    return isDeputadosRoute
      ? 'bg-[#edf7f1] text-[#25384d]'
      : 'text-slate-600 hover:bg-[#edf7f1] hover:text-[#25384d]';
  }, [isDeputadosRoute]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDeputadosOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Image
              src="/logo-compare-politicos.png"
              alt="Logo Compare Politicos"
              width={36}
              height={36}
              className="size-9 object-cover"
              priority
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Portal de Dados</p>
            <h1 className="text-base font-bold text-[#25384d]">Compare Politicos</h1>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Navegacao principal">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDeputadosOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${deputyTriggerClass}`}
              aria-expanded={isDeputadosOpen}
              aria-haspopup="menu"
            >
              <GraduationCap className="size-4" aria-hidden="true" />
              Deputados
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>

            {isDeputadosOpen ? (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {deputadoLinks.map((item) => {
                  const Icon = item.icon;

                  if (item.disabled) {
                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-400"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="size-4" aria-hidden="true" />
                          {item.label}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          Em breve
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsDeputadosOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-[#edf7f1] hover:text-[#25384d]"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <Link
            href="/comparar"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
              isCompararRoute
                ? 'bg-[#25384d] text-white'
                : 'bg-[#10c96f] text-white hover:bg-[#08b862]'
            }`}
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Compare Agora
          </Link>

          <Link
            href={isHomeIndicators ? '/#indicadores' : '/#indicadores'}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isHomeIndicators ? 'bg-[#edf7f1] text-[#25384d]' : 'text-slate-600 hover:bg-[#edf7f1] hover:text-[#25384d]'
            }`}
          >
            <BarChart3 className="size-4" aria-hidden="true" />
            Indicadores
          </Link>
        </nav>
      </div>
    </header>
  );
}
