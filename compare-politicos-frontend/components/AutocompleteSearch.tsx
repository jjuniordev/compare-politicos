'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, UserPlus2 } from 'lucide-react';
import type { Deputado } from '@/types/deputado';

interface AutocompleteSearchProps {
  deputados: Deputado[];
  excludedDeputadoIds?: number[];
  onSelect: (deputado: Deputado) => void;
  loading?: boolean;
  label?: string;
  inputId?: string;
  placeholder?: string;
  helperText?: string;
}

const MAX_RESULTS = 8;

export function AutocompleteSearch({
  deputados,
  excludedDeputadoIds = [],
  onSelect,
  loading = false,
  label = 'Buscar parlamentar',
  inputId = 'comparar-autocomplete',
  placeholder = 'Digite o nome do deputado',
  helperText
}: AutocompleteSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      return [];
    }

    const excludedIds = new Set(excludedDeputadoIds);

    return deputados
      .filter((deputado) => !excludedIds.has(deputado.id))
      .filter((deputado) => deputado.nome.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        const aStarts = a.nome.toLowerCase().startsWith(normalizedQuery);
        const bStarts = b.nome.toLowerCase().startsWith(normalizedQuery);

        if (aStarts && !bStarts) {
          return -1;
        }
        if (!aStarts && bStarts) {
          return 1;
        }

        return a.nome.localeCompare(b.nome);
      })
      .slice(0, MAX_RESULTS);
  }, [deputados, excludedDeputadoIds, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (deputado: Deputado) => {
    onSelect(deputado);
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const highlighted = suggestions[highlightedIndex];
      if (highlighted) {
        handleSelect(highlighted);
      }
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative z-50 overflow-visible">
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <input
          id={inputId}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlightedIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9fd1b7] focus:ring-4 focus:ring-[#dbf3e6] disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      {isOpen && suggestions.length > 0 ? (
        <ul className="absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {suggestions.map((deputado, index) => (
            <li key={deputado.id}>
              <button
                type="button"
                onClick={() => handleSelect(deputado)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                  index === highlightedIndex ? 'bg-[#edf7f1]' : 'hover:bg-slate-50'
                }`}
              >
                <span>
                  <span className="block text-sm font-medium text-[#25384d]">{deputado.nome}</span>
                  <span className="text-xs text-slate-500">
                    {deputado.sigla_partido} • {deputado.sigla_uf}
                  </span>
                </span>
                <UserPlus2 className="size-4 text-slate-400" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {isOpen && query.trim().length > 0 && suggestions.length === 0 ? (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500 shadow-xl">
          Nenhum parlamentar encontrado para esta busca.
        </div>
      ) : null}

      {helperText ? <p className="mt-2 text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}