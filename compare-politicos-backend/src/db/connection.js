const { Pool } = require('pg');

// Inicializa a conexão usando a variável de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;