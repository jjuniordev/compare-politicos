const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const CAMARA_API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';
const sqsClient = new SQSClient({ region: 'us-east-1' });

async function fetchDeputadosIds() {
  const response = await fetch(`${CAMARA_API_BASE}/deputados?itens=1000`);
  if (!response.ok) throw new Error(`Falha ao buscar deputados: ${response.status}`);
  const json = await response.json();
  return (json.dados || []).map((dep) => dep.id);
}

module.exports.handler = async () => {
  console.log('Orquestrador Iniciado: Buscando lista de deputados...');
  
  try {
    const deputadosIds = await fetchDeputadosIds();
    console.log(`Encontrados ${deputadosIds.length} deputados. Enviando para o SQS...`);

    const filaUrl = process.env.FILA_DESPESAS_URL;

    // Manda os IDs para a fila um por um
    for (const deputadoId of deputadosIds) {
      const command = new SendMessageCommand({
        QueueUrl: filaUrl,
        MessageBody: JSON.stringify({ deputadoId })
      });
      await sqsClient.send(command);
    }

    console.log('Todos os deputados enfileirados com sucesso!');
    return { statusCode: 200, body: 'Orquestração concluída' };
  } catch (error) {
    console.error('Erro no orquestrador:', error);
    throw error;
  }
};