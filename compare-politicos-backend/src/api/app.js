const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const pool = require('../db/connection'); // Importa a conexão centralizada
const serverless = require('serverless-http');

const app = new Koa();
const router = new Router();

// Libera requisições do seu frontend local (localhost:3000)
app.use(cors());

// Rota de status (Health Check)
router.get('/', async (ctx) => {
  ctx.body = { 
    success: true, 
    message: 'API Compare Políticos está online!',
    version: '1.0.0'
  };
});

router.get('/api', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'Endpoints disponíveis em /api/df/deputados e /api/df/deputados/:id/despesas/resumo'
  };
});

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
};

// Endpoint paginado para listar deputados com suporte a rolagem infinita no frontend
router.get('/api/df/deputados', async (ctx) => {
  const limitParam = parsePositiveInt(ctx.query.limit);
  const offsetParam = parsePositiveInt(ctx.query.offset);

  const limit = limitParam === null ? DEFAULT_LIMIT : limitParam;
  const offset = offsetParam === null ? 0 : offsetParam;

  if (limit < 1 || limit > MAX_LIMIT || offset < 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `Parâmetros inválidos. Use limit entre 1 e ${MAX_LIMIT} e offset maior ou igual a 0.`
    };
    return;
  }

  const client = await pool.connect();
  try {
    const query = `
      SELECT id, nome, sigla_partido, sigla_uf, url_foto 
      FROM df_deputados 
      ORDER BY nome ASC 
      LIMIT $1
      OFFSET $2;
    `;
    const result = await client.query(query, [limit + 1, offset]);
    const hasMore = result.rows.length > limit;
    const data = hasMore ? result.rows.slice(0, limit) : result.rows;
    
    ctx.body = {
      success: true,
      data,
      pagination: {
        limit,
        offset,
        has_more: hasMore,
        next_offset: hasMore ? offset + limit : null
      }
    };
  } catch (error) {
    console.error('Erro ao buscar deputados:', error);
    ctx.status = 500;
    ctx.body = { success: false, message: 'Erro interno no servidor' };
  } finally {
    client.release();
  }
});

router.get('/api/df/deputados/:id/despesas/resumo', async (ctx) => {
  const deputadoId = parsePositiveInt(ctx.params.id);

  if (deputadoId === null || deputadoId < 1) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: 'ID de deputado inválido.'
    };
    return;
  }

  const client = await pool.connect();

  try {
    const query = `
      WITH deputado_despesas AS (
        SELECT
          tipo_despesa,
          valor,
          data_emissao
        FROM df_deputado_despesas
        WHERE deputado_id = $1
      ),
      monthly_totals AS (
        SELECT
          DATE_TRUNC('month', data_emissao)::date AS mes,
          SUM(valor) AS total_mes
        FROM deputado_despesas
        WHERE data_emissao IS NOT NULL
        GROUP BY 1
      ),
      top_categoria AS (
        SELECT
          tipo_despesa,
          SUM(valor) AS total_categoria
        FROM deputado_despesas
        WHERE tipo_despesa IS NOT NULL
        GROUP BY tipo_despesa
        ORDER BY total_categoria DESC
        LIMIT 1
      )
      SELECT
        COALESCE((SELECT SUM(valor) FROM deputado_despesas), 0)::float8 AS gasto_total_acumulado,
        COALESCE((SELECT MAX(valor) FROM deputado_despesas), 0)::float8 AS maior_despesa_unica,
        COALESCE((SELECT AVG(total_mes) FROM monthly_totals), 0)::float8 AS gasto_medio_mensal,
        COALESCE((SELECT tipo_despesa FROM top_categoria), 'Sem categoria') AS categoria_que_mais_gastou;
    `;

    const result = await client.query(query, [deputadoId]);
    const row = result.rows[0];

    ctx.body = {
      success: true,
      data: {
        gastoTotalAcumulado: row.gasto_total_acumulado,
        maiorDespesaUnica: row.maior_despesa_unica,
        gastoMedioMensal: row.gasto_medio_mensal,
        categoriaMaisGastou: row.categoria_que_mais_gastou
      }
    };
  } catch (error) {
    console.error('Erro ao resumir despesas do deputado:', error);
    ctx.status = 500;
    ctx.body = { success: false, message: 'Erro interno no servidor' };
  } finally {
    client.release();
  }
});

app.use(router.routes()).use(router.allowedMethods());

module.exports.handler = serverless(app);