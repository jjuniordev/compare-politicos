'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRightLeft, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { ComparisonHeader } from '@/components/ComparisonHeader';
import { ComparisonTable } from '@/components/ComparisonTable';
import type { Deputado, DeputadosResponse } from '@/types/deputado';
import type { DespesaResumo, DespesaResumoResponse } from '@/types/comparison';

const PAGE_SIZE = 200;

function CompararPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deputados, setDeputados] = useState<Deputado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeputados, setSelectedDeputados] = useState<Array<Deputado | null>>([null, null]);
  const [despesasByDeputado, setDespesasByDeputado] = useState<Record<number, DespesaResumo>>({});
  const [resumoLoadingByDeputado, setResumoLoadingByDeputado] = useState<Record<number, boolean>>({});
  const [resumoError, setResumoError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchAllDeputados = async () => {
      try {
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const collected: Deputado[] = [];
        const seenIds = new Set<number>();

        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const params = new URLSearchParams({
            limit: String(PAGE_SIZE),
            offset: String(offset)
          });

          const endpoint = `${baseUrl}/api/df/deputados?${params.toString()}`;
          const response = await fetch(endpoint, { signal: controller.signal });

          if (!response.ok) {
            throw new Error(`Falha na API (${response.status})`);
          }

          const json: DeputadosResponse = await response.json();
          if (!json.success) {
            throw new Error(json.message || 'Erro ao carregar deputados');
          }

          const incoming = json.data ?? [];

          for (const deputado of incoming) {
            if (!seenIds.has(deputado.id)) {
              seenIds.add(deputado.id);
              collected.push(deputado);
            }
          }

          const apiHasMore = json.pagination?.has_more ?? incoming.length === PAGE_SIZE;
          const apiNextOffset = json.pagination?.next_offset;
          const fallbackNextOffset = offset + incoming.length;
          const nextOffset = apiNextOffset ?? fallbackNextOffset;

          if (incoming.length === 0 || !apiHasMore || nextOffset <= offset) {
            hasMore = false;
          } else {
            offset = nextOffset;
          }
        }

        if (!active) {
          return;
        }

        setDeputados(collected);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Erro inesperado ao carregar deputados';
        if (active) {
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchAllDeputados();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const fetchDespesaResumo = async (deputadoId: number) => {
    if (despesasByDeputado[deputadoId] || resumoLoadingByDeputado[deputadoId]) {
      return;
    }

    setResumoLoadingByDeputado((prev) => ({
      ...prev,
      [deputadoId]: true
    }));

    try {
      setResumoError(null);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const endpoint = `${baseUrl}/api/df/deputados/${deputadoId}/despesas/resumo`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Falha na API (${response.status})`);
      }

      const json: DespesaResumoResponse = await response.json();
      if (!json.success) {
        throw new Error(json.message || 'Erro ao carregar resumo de despesas');
      }

      setDespesasByDeputado((prev) => ({
        ...prev,
        [deputadoId]: json.data
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao carregar despesas';
      setResumoError(message);
    } finally {
      setResumoLoadingByDeputado((prev) => ({
        ...prev,
        [deputadoId]: false
      }));
    }
  };

  const updateComparacaoQueryParam = (slotIndex: number, deputadoId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    const key = slotIndex === 0 ? 'deputado1' : 'deputado2';

    if (deputadoId === null) {
      params.delete(key);
    } else {
      params.set(key, String(deputadoId));
    }

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  const parseDeputadoId = (value: string | null) => {
    if (!value) {
      return null;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  };

  const findDeputadoById = (id: number) => deputados.find((item) => Number(item.id) === id) ?? null;

  useEffect(() => {
    if (loading || deputados.length === 0) {
      return;
    }

    const deputado1IdFromQuery = parseDeputadoId(searchParams.get('deputado1'));
    const deputado2IdFromQuery = parseDeputadoId(searchParams.get('deputado2'));
    const deputado1Selected = deputado1IdFromQuery ? findDeputadoById(deputado1IdFromQuery) : null;
    const deputado2Raw = deputado2IdFromQuery ? findDeputadoById(deputado2IdFromQuery) : null;
    const deputado2Selected = deputado1Selected && deputado2Raw?.id === deputado1Selected.id ? null : deputado2Raw;

    setSelectedDeputados((prev) => {
      const firstUnchanged = (prev[0]?.id ?? null) === (deputado1Selected?.id ?? null);
      const secondUnchanged = (prev[1]?.id ?? null) === (deputado2Selected?.id ?? null);

      if (firstUnchanged && secondUnchanged) {
        return prev;
      }

      return [deputado1Selected, deputado2Selected];
    });
  }, [deputados, loading, searchParams]);

  useEffect(() => {
    const first = selectedDeputados[0];
    const second = selectedDeputados[1];

    if (first) {
      void fetchDespesaResumo(first.id);
    }

    if (second) {
      void fetchDespesaResumo(second.id);
    }
  }, [selectedDeputados]);

  const handleSelectDeputado = (slotIndex: number, deputado: Deputado) => {
    const otherSlotIndex = slotIndex === 0 ? 1 : 0;
    const otherSelected = selectedDeputados[otherSlotIndex];

    if (otherSelected?.id === deputado.id) {
      setResumoError('Este parlamentar ja esta selecionado no outro card.');
      return;
    }

    const previousSelected = selectedDeputados[slotIndex];

    setSelectedDeputados((prev) => {
      const next: Array<Deputado | null> = [...prev];
      next[slotIndex] = deputado;
      return next;
    });

    if (previousSelected && previousSelected.id !== deputado.id) {
      setDespesasByDeputado((prev) => {
        const next = { ...prev };
        delete next[previousSelected.id];
        return next;
      });

      setResumoLoadingByDeputado((prev) => {
        const next = { ...prev };
        delete next[previousSelected.id];
        return next;
      });
    }

    setResumoError(null);
    updateComparacaoQueryParam(slotIndex, deputado.id);
    void fetchDespesaResumo(deputado.id);
  };

  const handleRemoveDeputado = (slotIndex: number) => {
    const removedDeputado = selectedDeputados[slotIndex];

    setSelectedDeputados((prev) => {
      const next: Array<Deputado | null> = [...prev];
      next[slotIndex] = null;
      return next;
    });

    updateComparacaoQueryParam(slotIndex, null);

    if (!removedDeputado) {
      return;
    }

    setDespesasByDeputado((prev) => {
      const next = { ...prev };
      delete next[removedDeputado.id];
      return next;
    });

    setResumoLoadingByDeputado((prev) => {
      const next = { ...prev };
      delete next[removedDeputado.id];
      return next;
    });

  };

  const selectedDeputadosList = selectedDeputados.filter((deputado): deputado is Deputado => deputado !== null);
  const isEmpty = selectedDeputadosList.length === 0;
  const hasOneSelected = selectedDeputadosList.length === 1;
  const hasTwoSelected = selectedDeputadosList.length === 2;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[radial-gradient(1100px_460px_at_15%_-15%,#dbe7f2_0%,transparent_55%),radial-gradient(900px_420px_at_100%_0%,#d9f3e6_0%,transparent_50%),linear-gradient(to_bottom,#f6fafc,#edf4f8)] pb-14 pt-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="mb-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#08b862]">Comparacao de Gastos</p>
            <h2 className="text-3xl font-bold tracking-tight text-[#25384d] sm:text-4xl">Comparar Politicos</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Selecione dois parlamentares para analisar lado a lado os indicadores de despesas da atividade parlamentar.
            </p>
          </section>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
              Carregando base de parlamentares...
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">{error}</div>
          ) : null}

          {!loading && !error ? (
            <>
              <ComparisonHeader
                deputados={deputados}
                selectedDeputados={selectedDeputados}
                onSelect={handleSelectDeputado}
                onRemove={handleRemoveDeputado}
                loading={loading}
              />

              {isEmpty ? (
                <section className="grid min-h-65 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
                  <div>
                    <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-[#edf7f1] text-[#08b862]">
                      <Search className="size-7" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#25384d]">Comece pesquisando o primeiro politico</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Use um dos campos de busca dos cards acima para adicionar dois deputados e destravar a comparacao completa.
                    </p>
                  </div>
                </section>
              ) : null}

              {hasOneSelected ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    <ArrowRightLeft className="size-3.5" aria-hidden="true" />
                    Falta 1 deputado para completar a comparacao
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    Selecione o segundo parlamentar no outro card para exibir a tabela de metricas de despesas.
                  </p>
                </section>
              ) : null}

              {hasTwoSelected ? (
                <ComparisonTable selectedDeputados={selectedDeputadosList} despesasByDeputado={despesasByDeputado} />
              ) : null}

              {hasTwoSelected &&
              (resumoLoadingByDeputado[selectedDeputadosList[0].id] || resumoLoadingByDeputado[selectedDeputadosList[1].id]) ? (
                <p className="mt-3 text-sm text-slate-500">Carregando resumo de despesas da comparacao...</p>
              ) : null}

              {resumoError ? (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {resumoError}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}

function CompararPageFallback() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[radial-gradient(1100px_460px_at_15%_-15%,#dbe7f2_0%,transparent_55%),radial-gradient(900px_420px_at_100%_0%,#d9f3e6_0%,transparent_50%),linear-gradient(to_bottom,#f6fafc,#edf4f8)] pb-14 pt-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="mb-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#08b862]">Comparacao de Gastos</p>
            <h2 className="text-3xl font-bold tracking-tight text-[#25384d] sm:text-4xl">Comparar Politicos</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Selecione dois parlamentares para analisar lado a lado os indicadores de despesas da atividade parlamentar.
            </p>
          </section>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Carregando base de parlamentares...
          </div>
        </div>
      </main>
    </>
  );
}

export default function CompararPage() {
  return (
    <Suspense fallback={<CompararPageFallback />}>
      <CompararPageContent />
    </Suspense>
  );
}