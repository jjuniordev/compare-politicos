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

// Endpoint para listar os deputados (Limitado a 50 inicialmente para não pesar a tela)
router.get('/api/df/deputados', async (ctx) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT id, nome, sigla_partido, sigla_uf, url_foto 
      FROM df_deputados 
      ORDER BY nome ASC 
      LIMIT 50;
    `;
    const result = await client.query(query);
    
    ctx.body = {
      success: true,
      data: result.rows
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