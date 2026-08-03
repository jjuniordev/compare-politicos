import Image from 'next/image';
import { BarChart3, LayoutGrid, Scale } from 'lucide-react';

const navItems = [
  { label: 'Deputados', href: '#deputados', icon: LayoutGrid },
  { label: 'Comparativos', href: '#', icon: Scale },
  { label: 'Indicadores', href: '#', icon: BarChart3 }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
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
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegacao principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-[#edf7f1] hover:text-[#25384d]"
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
