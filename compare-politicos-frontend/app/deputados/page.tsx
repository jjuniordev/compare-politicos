'use client';

import { useEffect, useMemo, useState } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { DeputadoCard } from '@/components/DeputadoCard';
import { Header } from '@/components/Header';
import { LoadingGrid } from '@/components/LoadingGrid';
import { EmptyState } from '@/components/EmptyState';
import type { Deputado, DeputadosResponse } from '@/types/deputado';

const PAGE_SIZE = 200;

export default function DeputadosPage() {
  const [deputados, setDeputados] = useState<Deputado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUf, setSelectedUf] = useState('');
  const [selectedPartido, setSelectedPartido] = useState('');

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

  const ufs = useMemo(() => {
    return [...new Set(deputados.map((item) => item.sigla_uf))].sort((a, b) => a.localeCompare(b));
  }, [deputados]);

  const partidos = useMemo(() => {
    return [...new Set(deputados.map((item) => item.sigla_partido))].sort((a, b) => a.localeCompare(b));
  }, [deputados]);

  const deputadosFiltrados = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return deputados.filter((item) => {
      const matchNome = normalizedSearch.length === 0 || item.nome.toLowerCase().includes(normalizedSearch);
      const matchUf = selectedUf.length === 0 || item.sigla_uf === selectedUf;
      const matchPartido = selectedPartido.length === 0 || item.sigla_partido === selectedPartido;
      return matchNome && matchUf && matchPartido;
    });
  }, [deputados, searchTerm, selectedUf, selectedPartido]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 || selectedUf.length > 0 || selectedPartido.length > 0;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc_0%,#f3f6fa_45%,#eef3f7_100%)] pb-12 pt-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="mb-8">
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur sm:p-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#08b862]">Exploração parlamentar</p>
              <h2 className="text-3xl font-bold tracking-tight text-[#25384d] sm:text-4xl">Deputados Federais</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Explore parlamentares, filtre por partido e estado e encontre rapidamente quem você quer comparar.
              </p>
            </div>
          </section>

          <div className="mb-6">
            <FilterBar
              searchTerm={searchTerm}
              selectedUf={selectedUf}
              selectedPartido={selectedPartido}
              ufs={ufs}
              partidos={partidos}
              total={deputados.length}
              filteredTotal={deputadosFiltrados.length}
              onSearchChange={setSearchTerm}
              onUfChange={setSelectedUf}
              onPartidoChange={setSelectedPartido}
            />
          </div>

          {loading ? <LoadingGrid /> : null}

          {!loading && error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            deputadosFiltrados.length > 0 ? (
              <section id="deputados" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {deputadosFiltrados.map((deputado) => (
                  <DeputadoCard key={deputado.id} deputado={deputado} />
                ))}
              </section>
            ) : (
              <EmptyState hasFilters={hasActiveFilters} />
            )
          ) : null}
        </div>
      </main>
    </>
  );
}