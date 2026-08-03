const pool = require('../db/connection'); // Importa a conexão centralizada

module.exports.handler = async (event) => {
  console.log('Iniciando sincronização ELT: Partidos Federais (df_partidos)...');
  const client = await pool.connect();

  try {
    // Busca os partidos (limitamos a 100 pois existem cerca de 30-40 ativos)
    const response = await fetch('https://dadosabertos.camara.leg.br/api/v2/partidos?itens=100');
    if (!response.ok) throw new Error(`Falha na API da Câmara: ${response.statusText}`);
    
    const json = await response.json();
    const partidos = json.dados;

    console.log(`Encontrados ${partidos.length} partidos. Processando carga...`);

    const query = `
      INSERT INTO df_partidos (id, nome, sigla, uri, payload)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        sigla = EXCLUDED.sigla,
        uri = EXCLUDED.uri,
        payload = EXCLUDED.payload;
    `;

    for (const p of partidos) {
      await client.query(query, [
        p.id,
        p.nome,
        p.sigla,
        p.uri,
        JSON.stringify(p)
      ]);
    }

    console.log('Sincronização df_partidos concluída!');
    return { statusCode: 200, body: 'Sync Partidos OK' };

  } catch (error) {
    console.error('Erro na sincronização df_partidos:', error);
    throw error;
  } finally {
    client.release();
  }
};