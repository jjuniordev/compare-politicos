require('dotenv').config();

const Koa = require('koa');
const Router = require('@koa/router');
const { Pool } = require('pg');
const serverless = require('serverless-http');

const app = new Koa();
const router = new Router();

// Conecta ao Supabase usando o Transaction Pooler
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

router.get('/', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'API online',
    endpoints: ['/api', '/api/politicos']
  };
});

router.get('/api', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'Use /api/politicos para listar dados'
  };
});

// Rota Hello World
router.get('/api/politicos', async (ctx) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM politicos');
    ctx.body = { success: true, data: result.rows };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Erro ao consultar banco de dados',
      error: error.message
    };
  } finally {
    client.release();
  }
});

app.use(router.routes()).use(router.allowedMethods());

// Encapsula o Koa para responder aos eventos da AWS Lambda
module.exports.handler = serverless(app);
