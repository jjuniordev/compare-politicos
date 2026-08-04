const pool = require('../db/connection');
const CAMARA_API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';
const API_ITENS = 100;

async function fetchDespesasByDeputado(deputadoId) {
  const despesas = [];
  let pagina = 1;

  while (true) {
    const url = `${CAMARA_API_BASE}/deputados/${deputadoId}/despesas?itens=${API_ITENS}&pagina=${pagina}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Falha despesas deputado ${deputadoId}`);

    const json = await response.json();
    const dados = json.dados || [];
    despesas.push(...dados);

    const hasNext = (json.links || []).some((link) => link.rel === 'next');
    if (!hasNext || dados.length === 0) break;

    pagina += 1;
  }
  return despesas;
}

// O event do SQS injeta os registros no parâmetro "event"
module.exports.handler = async (event) => {
  const client = await pool.connect();

  try {
    // Como definimos batchSize: 1, o array event.Records terá apenas 1 item
    for (const record of event.Records) {
      // Pega o ID que o Orquestrador colocou na fila
      const { deputadoId } = JSON.parse(record.body);
      console.log(`Worker Iniciado: Processando despesas do deputado ${deputadoId}`);

      const despesas = await fetchDespesasByDeputado(deputadoId);

      const deleteQuery = 'DELETE FROM df_deputado_despesas WHERE deputado_id = $1';
      const insertQuery = `
        INSERT INTO df_deputado_despesas (deputado_id, tipo_despesa, valor, data_emissao, descricao, payload)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await client.query('BEGIN'); // Abre uma transação no banco
      await client.query(deleteQuery, [deputadoId]);

      for (const despesa of despesas) {
        const valor = despesa.valorLiquido ?? despesa.valorDocumento ?? null;
        const descricao = [despesa.nomeFornecedor, despesa.tipoDocumento].filter(Boolean).join(' - ');

        await client.query(insertQuery, [
          deputadoId,
          despesa.tipoDespesa || null,
          valor,
          despesa.dataDocumento || null,
          descricao || null,
          JSON.stringify(despesa)
        ]);
      }
      
      await client.query('COMMIT'); // Salva as alterações
      console.log(`Sucesso: Deputado ${deputadoId} teve ${despesas.length} despesas salvas.`);
    }
  } catch (error) {
    await client.query('ROLLBACK'); // Desfaz se der erro
    console.error('Erro no Worker de despesas:', error);
    throw error; // Lançar o erro avisa a AWS para tentar de novo!
  } finally {
    client.release();
  }
};