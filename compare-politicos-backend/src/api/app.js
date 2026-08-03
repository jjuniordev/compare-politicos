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
  ctx.body = { success: true, message: 'Endpoints disponíveis em /api/df/deputados' };
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

app.use(router.routes()).use(router.allowedMethods());

module.exports.handler = serverless(app);