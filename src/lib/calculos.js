import { calcularINSS, calcularIRRF } from './tabelas.js';

/**
 * Calcula a diferença de meses e dias entre duas datas
 */
export function calcularTempoServico(admissao, demissao) {
  const dtAdmin = new Date(admissao + 'T12:00:00');
  const dtDemis = new Date(demissao + 'T12:00:00');
  
  let anos = dtDemis.getFullYear() - dtAdmin.getFullYear();
  let meses = dtDemis.getMonth() - dtAdmin.getMonth();
  
  if (meses < 0) {
    anos--;
    meses += 12;
  }
  
  const mesesTotais = (anos * 12) + meses;
  return { anos, meses, mesesTotais };
}

/**
 * Calcula os dias trabalhados no mês da rescisão
 */
export function diasTrabalhadosNoMes(demissao) {
  const dt = new Date(demissao + 'T12:00:00');
  return dt.getDate();
}

/**
 * Motor principal de cálculo da rescisão
 */
export function calcularRescisao({
  salario,
  admissao,
  demissao,
  motivo, // 'sem_justa_causa', 'com_justa_causa', 'pedido_demissao', 'acordo', 'fim_experiencia'
  avisoPrevio, // 'trabalhado', 'indenizado'
  dependentes = 0,
  saldoFGTSInfo = null // Saldo informado pelo usuário, opcional
}) {
  const { anos, mesesTotais } = calcularTempoServico(admissao, demissao);
  const diasMes = diasTrabalhadosNoMes(demissao);
  
  const resultados = {
    verbas: [],
    descontos: [],
    resumo: {
      bruto: 0,
      descontos: 0,
      liquido: 0,
      fgts_saque: 0,
      fgts_multa: 0
    }
  };

  const addVerba = (nome, valor, irrfBase = 0, inssBase = 0, fgtsBase = 0) => {
    resultados.verbas.push({ nome, valor });
    resultados.resumo.bruto += valor;
    return { valor, irrfBase, inssBase, fgtsBase };
  };

  // 1. Saldo de Salário
  const saldoSalario = (salario / 30) * diasMes;
  addVerba('Saldo de Salário', saldoSalario, saldoSalario, saldoSalario, saldoSalario);

  // 2. Aviso Prévio (Indenizado)
  let diasAviso = 30;
  let valorAviso = 0;
  
  if (avisoPrevio === 'indenizado') {
    if (motivo === 'sem_justa_causa') {
      diasAviso = Math.min(90, 30 + (3 * anos));
      valorAviso = (salario / 30) * diasAviso;
      addVerba('Aviso Prévio Indenizado', valorAviso, 0, 0, valorAviso);
    } else if (motivo === 'acordo') {
      diasAviso = Math.min(90, 30 + (3 * anos));
      valorAviso = ((salario / 30) * diasAviso) / 2; // Acordo paga metade
      addVerba('Aviso Prévio Indenizado (50%)', valorAviso, 0, 0, valorAviso);
    }
  } else if (motivo === 'pedido_demissao' && avisoPrevio === 'nao_cumprido') {
    // Desconto por não cumprimento do aviso prévio
    resultados.descontos.push({ nome: 'Aviso Prévio Não Cumprido', valor: salario });
    resultados.resumo.descontos += salario;
  }

  // 3. 13º Salário Proporcional
  let meses13o = new Date(demissao + 'T12:00:00').getMonth();
  if (diasMes >= 15) meses13o++;
  
  // Projeção do aviso prévio no 13º
  if (valorAviso > 0) {
    const projecaoDias = diasMes + diasAviso;
    if (projecaoDias >= 45) meses13o++; // Simplificação da projeção
    if (meses13o > 12) meses13o = 12;
  }

  if (['sem_justa_causa', 'pedido_demissao', 'acordo', 'fim_experiencia'].includes(motivo)) {
    const valor13o = (salario / 12) * meses13o;
    addVerba('13º Salário Proporcional', valor13o, valor13o, valor13o, valor13o);
  }

  // 4. Férias Proporcionais + 1/3
  let mesesFerias = mesesTotais % 12;
  if (diasMes >= 15) mesesFerias++;
  if (valorAviso > 0) {
    // Projeção
    const projecaoMeses = Math.floor(diasAviso / 30);
    mesesFerias += projecaoMeses;
  }
  if (mesesFerias > 12) mesesFerias = 12;

  if (['sem_justa_causa', 'pedido_demissao', 'acordo', 'fim_experiencia'].includes(motivo)) {
    const valorFeriasProp = (salario / 12) * mesesFerias;
    const tercoFeriasProp = valorFeriasProp / 3;
    addVerba('Férias Proporcionais', valorFeriasProp);
    addVerba('1/3 S/ Férias Proporcionais', tercoFeriasProp);
  }

  // 5. Férias Vencidas + 1/3 (assumindo 1 período para fins de MVP)
  const anosCompletos = Math.floor(mesesTotais / 12);
  // Na prática, perguntaríamos se há férias vencidas. 
  // Para MVP, vamos assumir que não há se não for especificado no form, 
  // mas deixaremos a lógica pronta.

  // --- CÁLCULO DE DESCONTOS (INSS e IRRF) ---
  
  // INSS sobre Saldo de Salário
  const inssSalario = calcularINSS(saldoSalario);
  if (inssSalario > 0) {
    resultados.descontos.push({ nome: 'INSS S/ Salário', valor: inssSalario });
    resultados.resumo.descontos += inssSalario;
  }
  
  // IRRF sobre Saldo de Salário
  const irrfSalario = calcularIRRF(saldoSalario, dependentes, inssSalario);
  if (irrfSalario > 0) {
    resultados.descontos.push({ nome: 'IRRF S/ Salário', valor: irrfSalario });
    resultados.resumo.descontos += irrfSalario;
  }

  // Descontos sobre 13º (Calculados Separadamente)
  const base13 = resultados.verbas.find(v => v.nome === '13º Salário Proporcional')?.valor || 0;
  if (base13 > 0) {
    const inss13 = calcularINSS(base13);
    const irrf13 = calcularIRRF(base13, dependentes, inss13);
    
    if (inss13 > 0) {
      resultados.descontos.push({ nome: 'INSS S/ 13º', valor: inss13 });
      resultados.resumo.descontos += inss13;
    }
    if (irrf13 > 0) {
      resultados.descontos.push({ nome: 'IRRF S/ 13º', valor: irrf13 });
      resultados.resumo.descontos += irrf13;
    }
  }

  // --- CÁLCULO FGTS E MULTA ---
  
  const saldoFGTSEstimado = (salario * 0.08) * mesesTotais;
  const saldoBaseFGTS = saldoFGTSInfo ? parseFloat(saldoFGTSInfo) : saldoFGTSEstimado;
  
  if (motivo === 'sem_justa_causa') {
    resultados.resumo.fgts_multa = saldoBaseFGTS * 0.40;
    resultados.resumo.fgts_saque = saldoBaseFGTS + resultados.resumo.fgts_multa;
  } else if (motivo === 'acordo') {
    resultados.resumo.fgts_multa = saldoBaseFGTS * 0.20;
    resultados.resumo.fgts_saque = (saldoBaseFGTS * 0.80) + resultados.resumo.fgts_multa;
  } else if (motivo === 'fim_experiencia') {
    resultados.resumo.fgts_saque = saldoBaseFGTS;
  }

  // Consolidação
  resultados.resumo.liquido = resultados.resumo.bruto - resultados.resumo.descontos;

  return resultados;
}
