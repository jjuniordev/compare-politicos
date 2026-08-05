function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function getMonthKey(dateValue) {
  const date = parseDate(dateValue);
  if (!date) {
    return null;
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

function isWeekend(dateValue) {
  const date = parseDate(dateValue);
  if (!date) {
    return false;
  }

  const day = date.getDay();
  return day === 0 || day === 6;
}

function getFornecedorName(row) {
  const nomeFornecedor = row.nome_fornecedor || row.nomeFornecedor;
  if (nomeFornecedor) {
    return String(nomeFornecedor).trim();
  }

  // Fallback para dados legados em "descricao": "Fornecedor - TipoDocumento"
  const descricao = String(row.descricao || '').trim();
  if (!descricao) {
    return 'Fornecedor nao identificado';
  }

  const [primeiraParte] = descricao.split(' - ');
  return (primeiraParte || 'Fornecedor nao identificado').trim();
}

function buildDespesaResumo(despesas) {
  const rows = Array.isArray(despesas) ? despesas : [];

  // Reduce principal: consolida totais por fornecedor e categoria.
  const aggregate = rows.reduce(
    (acc, row) => {
      const valor = toNumber(row.valor);
      const tipoDespesa = normalizeText(row.tipo_despesa || row.tipoDespesa);
      const fornecedor = getFornecedorName(row);

      acc.total += valor;
      acc.maiorDespesaUnica = Math.max(acc.maiorDespesaUnica, valor);
      acc.count += 1;

      acc.totalByFornecedor[fornecedor] = (acc.totalByFornecedor[fornecedor] || 0) + valor;
      acc.totalByCategoria[tipoDespesa] = (acc.totalByCategoria[tipoDespesa] || 0) + valor;

      // Regra de negocio: categoria de divulgacao/marketing.
      if (tipoDespesa.includes('DIVULGACAO') || tipoDespesa.includes('MARKETING')) {
        acc.gastoDivulgacaoMarketing += valor;
      }

      // Agrupamento mensal para media de gasto por mes.
      const monthKey = getMonthKey(row.data_emissao || row.dataDocumento || row.data_documento_payload);
      if (monthKey) {
        acc.totalByMonth[monthKey] = (acc.totalByMonth[monthKey] || 0) + valor;
      }

      return acc;
    },
    {
      total: 0,
      maiorDespesaUnica: 0,
      count: 0,
      gastoDivulgacaoMarketing: 0,
      totalByFornecedor: {},
      totalByCategoria: {},
      totalByMonth: {}
    }
  );

  const monthTotals = Object.values(aggregate.totalByMonth);
  const gastoMedioMensal =
    monthTotals.length > 0 ? monthTotals.reduce((sum, monthTotal) => sum + monthTotal, 0) / monthTotals.length : 0;

  const maiorFornecedorEntry = Object.entries(aggregate.totalByFornecedor).sort((a, b) => b[1] - a[1])[0];
  const categoriaMaisGastouEntry = Object.entries(aggregate.totalByCategoria).sort((a, b) => b[1] - a[1])[0];

  // Filter + reduce: considera apenas despesas emitidas em sabado/domingo.
  const gastoFinaisSemana = rows
    .filter((row) => isWeekend(row.data_emissao || row.dataDocumento || row.data_documento_payload))
    .reduce((sum, row) => sum + toNumber(row.valor), 0);

  return {
    gastoTotalAcumulado: aggregate.total,
    maiorDespesaUnica: aggregate.maiorDespesaUnica,
    gastoMedioMensal,
    categoriaMaisGastou: categoriaMaisGastouEntry ? categoriaMaisGastouEntry[0] : 'Sem categoria',
    maiorFornecedorNome: maiorFornecedorEntry ? maiorFornecedorEntry[0] : 'Fornecedor nao identificado',
    maiorFornecedorValorTotal: maiorFornecedorEntry ? maiorFornecedorEntry[1] : 0,
    gastoDivulgacaoMarketing: aggregate.gastoDivulgacaoMarketing,
    volumeNotasEmitidas: aggregate.count,
    gastosFinaisSemana: gastoFinaisSemana
  };
}

module.exports = {
  buildDespesaResumo
};
