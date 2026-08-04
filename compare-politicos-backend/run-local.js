require('dotenv').config(); 
const worker = require('./src/workers/sync-despesas-worker');

const CAMARA_API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchDeputadosIds() {
  const response = await fetch(`${CAMARA_API_BASE}/deputados?itens=1000`);
  if (!response.ok) throw new Error('Falha ao buscar deputados da API.');
  const json = await response.json();
  return (json.dados || []).map((dep) => dep.id);
}

async function rodarWorker(id) {
  const mockSqsEvent = {
    Records: [{ body: JSON.stringify({ deputadoId: id }) }]
  };
  await worker.handler(mockSqsEvent);
}

async function iniciarSimulacao() {
  const argumento = process.argv[2];
  // Pega o terceiro argumento passado no terminal (o ID para continuar)
  const idContinuar = process.argv[3]; 

  if (!argumento) {
    console.error('❌ Erro: Forneça um ID ou digite "all".');
    console.info('👉 Exemplos: \n   node run-local.js 204521 \n   node run-local.js all \n   node run-local.js all 178927');
    process.exit(1);
  }

  try {
    if (argumento.toLowerCase() === 'all') {
      console.log('🔍 Buscando lista completa de deputados...');
      const ids = await fetchDeputadosIds();
      
      let indexInicial = 0;

      // Se você passou um ID para continuar, achamos a posição dele na lista
      if (idContinuar) {
        const idAlvo = parseInt(idContinuar, 10);
        indexInicial = ids.indexOf(idAlvo);

        if (indexInicial === -1) {
          console.error(`❌ Erro: O ID ${idAlvo} não foi encontrado na lista da Câmara.`);
          process.exit(1);
        }
        console.log(`⏩ Retomando a partir do ID ${idAlvo} (Posição ${indexInicial + 1} de ${ids.length})...\n`);
      } else {
        console.log(`🚀 Iniciando sincronização em lote para ${ids.length} deputados...\n`);
      }
      
      // O loop começa do indexInicial em vez do zero
      for (let i = indexInicial; i < ids.length; i++) {
        const id = ids[i];
        console.log(`[${i + 1}/${ids.length}] Processando ID: ${id}...`);
        
        try {
          await rodarWorker(id);
        } catch (err) {
          console.error(`⚠️ Erro ao processar o ID ${id}. Pulando para o próximo.`, err.message);
        }

        await sleep(1000);
      }
      
      console.log('\n✅ Sincronização em lote concluída com sucesso!');
      process.exit(0);
    } 
    
    else if (!isNaN(argumento)) {
      const idTeste = parseInt(argumento, 10);
      console.log(`\nIniciando simulação local para o deputado ID: ${idTeste}...`);
      await rodarWorker(idTeste);
      console.log('✅ Teste concluído com sucesso!\n');
      process.exit(0);
    } 
    
    else {
      console.error('❌ Parâmetro inválido.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Falha fatal no script local:', error);
    process.exit(1);
  }
}

iniciarSimulacao();