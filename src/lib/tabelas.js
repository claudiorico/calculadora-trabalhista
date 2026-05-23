/**
 * Tabelas de deduções e alíquotas atualizadas para 2026
 */

export const SALARIO_MINIMO = 1621.00;

// INSS Progressivo 2026
// Teto INSS: R$ 8.475,55 | Desconto máximo: R$ 988,09
export const TABELA_INSS = [
  { ate: 1621.00, aliquota: 0.075, deducao: 0 },
  { ate: 2902.84, aliquota: 0.09, deducao: 24.32 },
  { ate: 4354.27, aliquota: 0.12, deducao: 111.40 },
  { ate: 8475.55, aliquota: 0.14, deducao: 198.49 },
  { ate: Infinity, aliquota: 0.14, deducao: 198.49 } // Acima do teto, cobra-se o teto
];

// IRRF Progressivo 2026 + Reforma Lei 15.270/2025
export const TABELA_IRRF = [
  { ate: 2428.80, aliquota: 0, deducao: 0 },
  { ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
  { ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
  { ate: Infinity, aliquota: 0.275, deducao: 908.73 }
];

export const DEDUCAO_DEPENDENTE = 189.59; // Valor padrão por dependente (estimativa 2026)

/**
 * Calcula o INSS progressivo sobre um valor base
 */
export function calcularINSS(salarioBruto) {
  if (!salarioBruto || salarioBruto <= 0) return 0;
  
  // Limita ao teto do INSS
  const baseCalculo = Math.min(salarioBruto, 8475.55);
  
  const faixa = TABELA_INSS.find(f => baseCalculo <= f.ate) || TABELA_INSS[TABELA_INSS.length - 1];
  
  const inss = (baseCalculo * faixa.aliquota) - faixa.deducao;
  return Math.max(0, inss); // Garante que não retorne negativo
}

/**
 * Calcula o IRRF com base na nova regra de 2026 (Lei 15.270/2025)
 */
export function calcularIRRF(salarioBruto, dependentes = 0, descontoINSS = 0) {
  if (!salarioBruto || salarioBruto <= 0) return 0;
  
  // Isenção total para rendas até R$ 5.000,00
  if (salarioBruto <= 5000.00) {
    return 0;
  }

  const baseCalculo = salarioBruto - descontoINSS - (dependentes * DEDUCAO_DEPENDENTE);
  
  const faixa = TABELA_IRRF.find(f => baseCalculo <= f.ate) || TABELA_IRRF[TABELA_IRRF.length - 1];
  const irrfBruto = (baseCalculo * faixa.aliquota) - faixa.deducao;
  const irrfCalculado = Math.max(0, irrfBruto);
  
  // Regra de transição/redutor para rendas entre R$ 5.000,01 e R$ 7.350,00
  if (salarioBruto > 5000.00 && salarioBruto <= 7350.00) {
    const redutor = 978.62 - (0.133145 * salarioBruto);
    const irrfFinal = irrfCalculado - redutor;
    return Math.max(0, irrfFinal);
  }
  
  return irrfCalculado;
}
