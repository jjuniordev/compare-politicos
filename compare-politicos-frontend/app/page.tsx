'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

// Interface para garantir tipagem dos dados
interface Deputado {
  id: number;
  nome: string;
  sigla_partido: string;
  sigla_uf: string;
  url_foto: string;
}

export default function Home() {
  const [deputados, setDeputados] = useState<Deputado[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    // Pega a raiz da API (na nuvem ou local)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Concatena com o endpoint específico que esta página precisa
    const endpoint = `${baseUrl}/api/df/deputados`;
    
    fetch(endpoint)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setDeputados(json.data);
        }
      })
      .catch((err) => console.error("Erro ao buscar dados:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2">Compare Políticos</h1>
          <p className="text-slate-500">Acompanhe e compare os dados abertos dos Deputados Federais.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-slate-400 animate-pulse">Carregando dados oficiais...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {deputados.map((deputado) => (
              <div 
                key={deputado.id} 
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center p-6"
              >
                {/* Foto do Parlamentar */}
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-slate-100 bg-slate-100 relative">
                  {deputado.url_foto ? (
                    <img 
                      src={deputado.url_foto} 
                      alt={`Foto de ${deputado.nome}`}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      Sem Foto
                    </div>
                  )}
                </div>

                {/* Informações */}
                <h2 className="text-lg font-bold text-slate-800 text-center leading-tight mb-1">
                  {deputado.nome}
                </h2>
                
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                    {deputado.sigla_partido}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                    {deputado.sigla_uf}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}