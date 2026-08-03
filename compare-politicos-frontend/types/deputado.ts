export interface Deputado {
  id: number;
  nome: string;
  sigla_partido: string;
  sigla_uf: string;
  url_foto: string;
}

export interface DeputadosResponse {
  success: boolean;
  data: Deputado[];
  pagination?: {
    limit: number;
    offset: number;
    has_more: boolean;
    next_offset: number | null;
  };
  message?: string;
}
