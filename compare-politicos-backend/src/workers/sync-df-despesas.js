const pool = require('../db/connection');

const CAMARA_API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';
const API_ITENS = 100;

async function fetchDeputadosIds() {
  const response = await fetch(`${CAMARA_API_BASE}/deputados?itens=1000`);
  if (!response.ok) {
    throw new Error(`Falha ao buscar deputados: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return (json.dados || []).map((dep) => dep.id);
}

async function fetchDespesasByDeputado(deputadoId) {
  const despesas = [];
  let pagina = 1;

  while (true) {
    const url = `${CAMARA_API_BASE}/deputados/${deputadoId}/despesas?itens=${API_ITENS}&pagina=${pagina}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Falha ao buscar despesas do deputado ${deputadoId}: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();
    const dados = json.dados || [];
    despesas.push(...dados);

    const hasNext = (json.links || []).some((link) => link.rel === 'next');
    if (!hasNext || dados.length === 0) {
      break;
    }

    pagina += 1;
  }

  return despesas;
}

module.exports.handler = async () => {
  console.log('Iniciando sincronizacao ELT: Despesas de Deputados (df_deputado_despesas)...');
  const client = await pool.connect();

  try {
    const deputadosIds = await fetchDeputadosIds();
    console.log(`Encontrados ${deputadosIds.length} deputados. Iniciando sincronizacao de despesas...`);

    const deleteQuery = 'DELETE FROM df_deputado_despesas WHERE deputado_id = $1';
    const insertQuery = `
      INSERT INTO df_deputado_despesas (
        deputado_id,
        tipo_despesa,
        valor,
        data_emissao,
        descricao,
        payload
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const deputadoId of deputadosIds) {
      const despesas = await fetchDespesasByDeputado(deputadoId);

      await client.query(deleteQuery, [deputadoId]);

      for (const despesa of despesas) {
        const valor = despesa.valorLiquido ?? despesa.valorDocumento ?? null;
        const descricao = [despesa.nomeFornecedor, despesa.tipoDocumento]
          .filter(Boolean)
          .join(' - ');

        await client.query(insertQuery, [
          deputadoId,
          despesa.tipoDespesa || null,
          valor,
          despesa.dataDocumento || null,
          descricao || null,
          JSON.stringify(despesa)
        ]);
      }

      console.log(`Deputado ${deputadoId}: ${despesas.length} despesas sincronizadas.`);
    }

    console.log('Sincronizacao de df_deputado_despesas concluida com sucesso!');
    return { statusCode: 200, body: 'Sync Despesas OK' };
  } catch (error) {
    console.error('Erro na sincronizacao df_deputado_despesas:', error);
    throw error;
  } finally {
    client.release();
  }
};
