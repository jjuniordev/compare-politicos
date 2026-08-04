import Link from 'next/link';
import { ArrowRight, BarChart3, CalendarDays, Landmark, LineChart, Newspaper, ShieldCheck, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';

const statCards = [
  {
    label: 'Gasto Total da Camara em 2026',
    value: 'R$ 1,42 bi',
    trend: '+4,8% vs. 2025',
    icon: Landmark
  },
  {
    label: 'Partido mais economico',
    value: 'NOVO',
    trend: 'Menor media de despesas',
    icon: ShieldCheck
  },
  {
    label: 'Ticket medio mensal',
    value: 'R$ 38,4 mil',
    trend: 'Baseado nos ultimos 12 meses',
    icon: LineChart
  },
  {
    label: 'Deputados monitorados',
    value: '513',
    trend: 'Cobertura nacional completa',
    icon: BarChart3
  }
];

const newsCards = [
  {
    title: 'Congresso amplia transparência de despesas parlamentares',
    date: '04 ago 2026',
    summary: 'Novos painéis facilitam o acompanhamento de gastos por gabinete, tipo de despesa e tendência mensal.',
    category: 'Transparência'
  },
  {
    title: 'Ferramenta de comparação entra em fase de expansão',
    date: '02 ago 2026',
    summary: 'A experiência lado a lado ganhou métricas de despesas e destaque visual para identificar menor gasto.',
    category: 'Produto'
  },
  {
    title: 'Radar político passa a consolidar indicadores em tempo quase real',
    date: '31 jul 2026',
    summary: 'Atualizações automáticas melhoram a leitura de comportamento por estado, partido e perfil de atuação.',
    category: 'Atualização'
  }
];

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc_0%,#f3f6fa_45%,#eef3f7_100%)] pb-16">
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-white/75">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,201,111,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(37,56,77,0.08),transparent_28%)]" />

          <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                <Sparkles className="size-4" aria-hidden="true" />
                Portal de transparencia politica
              </div>

              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-[#1f3449] sm:text-5xl lg:text-6xl">
                Transparência Política na Palma da Mão
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Compare deputados lado a lado, acompanhe indicadores de gasto e explore dados públicos com uma experiência clara, rápida e centrada em decisão.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/comparar"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#10c96f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#08b862]"
                >
                  Comparar Políticos
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/deputados"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#25384d] shadow-sm transition-colors hover:border-[#cfe4d8] hover:bg-[#f7fbf9]"
                >
                  Explorar Deputados
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="font-semibold text-[#25384d]">Base consolidada</p>
                  <p className="mt-1">Dados organizados para leitura comparativa e navegação rápida.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="font-semibold text-[#25384d]">Experiência SaaS</p>
                  <p className="mt-1">Interface limpa, responsiva e orientada a conversão.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="font-semibold text-[#25384d]">Atualizações contínuas</p>
                  <p className="mt-1">Indicadores prontos para evoluir com novas métricas.</p>
                </div>
              </div>
            </div>

            <div className="grid content-start gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Visão geral</p>
                    <h3 className="text-lg font-semibold text-[#25384d]">Painel executivo</h3>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700">
                    <BarChart3 className="size-5" aria-hidden="true" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <article key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">{card.label}</p>
                            <p className="mt-2 text-2xl font-semibold text-[#25384d]">{card.value}</p>
                          </div>
                          <div className="rounded-xl bg-white p-2 text-[#08b862] shadow-sm">
                            <Icon className="size-5" aria-hidden="true" />
                          </div>
                        </div>
                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{card.trend}</p>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Indicadores rápidos
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">Crescimento mensal</span>
                    <span className="text-sm font-semibold text-[#25384d]">+12,4%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">Transações analisadas</span>
                    <span className="text-sm font-semibold text-[#25384d]">84,2 mil</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">Última atualização</span>
                    <span className="text-sm font-semibold text-[#25384d]">Há 18 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="indicadores" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Dashboards preview</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#25384d] sm:text-3xl">Indicadores em destaque</h3>
            </div>
            <p className="hidden max-w-xl text-sm text-slate-500 md:block">
              Cards rápidos para leitura executiva antes de abrir os detalhes por deputado ou comparar perfis.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="rounded-2xl bg-[#edf7f1] p-3 text-[#08b862]">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">2026</span>
                  </div>
                  <p className="mt-5 text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[#25384d]">{card.value}</p>
                  <p className="mt-2 text-sm text-slate-600">{card.trend}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Radar político</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#25384d] sm:text-3xl">Últimas atualizações</h3>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {newsCards.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-44 bg-[linear-gradient(135deg,#e5edf4_0%,#f8fbfd_45%,#dff3e8_100%)] p-5">
                  <div className="flex h-full items-start justify-between">
                    <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                      {item.category}
                    </div>
                    <div className="grid size-12 place-items-center rounded-2xl bg-white/75 text-[#25384d] shadow-sm">
                      <Newspaper className="size-5" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/60 bg-white/80 p-3 text-xs font-medium text-slate-500 backdrop-blur">
                    Imagem de destaque ilustrativa
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.date}</p>
                  <h4 className="mt-3 text-lg font-semibold leading-snug text-[#25384d]">{item.title}</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}