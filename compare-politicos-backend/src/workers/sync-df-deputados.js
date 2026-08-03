const pool = require('../db/connection'); // Importa a conexão centralizada

module.exports.handler = async (event) => {
  console.log('Iniciando sincronização ELT: Deputados Federais (df_deputados)...');
  const client = await pool.connect();

  try {
    // 1. Extração (Extract)
    const response = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000');
    if (!response.ok) throw new Error(`Falha na API da Câmara: ${response.statusText}`);
    
    const json = await response.json();
    const deputados = json.dados;

    console.log(`Encontrados ${deputados.length} deputados. Processando carga...`);

    // 2. Query de Upsert (Insere ou Atualiza)
    // Atualizamos os campos estruturados para busca e esmagamos o payload antigo com o novo
    const query = `
      INSERT INTO df_deputados (
        id, nome, sigla_partido, uri_partido, partido_id, 
        sigla_uf, id_legislatura, url_foto, email, uri, payload
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        sigla_partido = EXCLUDED.sigla_partido,
        uri_partido = EXCLUDED.uri_partido,
        partido_id = EXCLUDED.partido_id,
        sigla_uf = EXCLUDED.sigla_uf,
        id_legislatura = EXCLUDED.id_legislatura,
        url_foto = EXCLUDED.url_foto,
        email = EXCLUDED.email,
        uri = EXCLUDED.uri,
        payload = EXCLUDED.payload;
    `;

    // 3. Carga e "Transformação" leve (Load)
    for (const dep of deputados) {
      // A API não devolve o partido_id solto, ele vem na URI: ".../partidos/38011"
      // Extraímos o ID quebrando a string para manter a integridade relacional
      const partidoId = dep.uriPartido ? parseInt(dep.uriPartido.split('/').pop(), 10) : null;

      await client.query(query, [
        dep.id,
        dep.nome,
        dep.siglaPartido,
        dep.uriPartido,
        partidoId,
        dep.siglaUf,
        dep.idLegislatura,
        dep.urlFoto,
        dep.email,
        dep.uri,
        JSON.stringify(dep) // <-- O SEGREDO DO ELT: Guarda o objeto cru no JSONB!
      ]);
    }

    console.log('Sincronização df_deputados concluída com sucesso!');
    return { statusCode: 200, body: 'Sync OK' };

  } catch (error) {
    console.error('Erro na sincronização df_deputados:', error);
    throw error;
  } finally {
    client.release();
  }
};