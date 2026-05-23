import assert from 'assert';
import { calcularINSS, calcularIRRF } from './src/lib/tabelas.js';
import { calcularRescisao, calcularTempoServico } from './src/lib/calculos.js';

console.log("Iniciando testes do Motor de Cálculo Trabalhista...\n");

// 1. Teste de INSS
const inss = calcularINSS(3000);
// Faixa 12%: (3000 * 0.12) - 111.40 = 360 - 111.40 = 248.60
assert.strictEqual(Math.abs(inss - 248.60) < 0.01, true, `INSS falhou: ${inss}`);
console.log("✅ Teste INSS passou");

// 2. Teste de IRRF (Nova regra 2026 - isenção até 5000)
const irrf1 = calcularIRRF(4500, 0, 400); // base = 4100 -> isento por ser < 5000 salário bruto
assert.strictEqual(irrf1, 0, "IRRF até R$ 5.000 deve ser isento");
console.log("✅ Teste IRRF Isenção (<5000) passou");

// 3. Teste Tempo de Serviço
const tempo = calcularTempoServico('2024-01-01', '2025-06-01');
assert.strictEqual(tempo.anos, 1);
assert.strictEqual(tempo.meses, 5);
assert.strictEqual(tempo.mesesTotais, 17);
console.log("✅ Teste Tempo de Serviço passou");

// 4. Teste de Rescisão Completa (Demissão sem justa causa)
const rescisao = calcularRescisao({
  salario: 3000,
  admissao: '2024-01-01',
  demissao: '2025-06-15',
  motivo: 'sem_justa_causa',
  avisoPrevio: 'indenizado',
  dependentes: 0,
  saldoFGTSInfo: 5000
});

// Verificações
const saldoSalario = rescisao.verbas.find(v => v.nome === 'Saldo de Salário');
// 15 dias de salário
assert.strictEqual(saldoSalario.valor, 1500, "Saldo de salário incorreto");

const avisoPrevio = rescisao.verbas.find(v => v.nome === 'Aviso Prévio Indenizado');
// 1 ano = 33 dias -> (3000/30) * 33 = 3300
assert.strictEqual(avisoPrevio.valor, 3300, "Aviso Prévio incorreto");

const multa = rescisao.resumo.fgts_multa;
assert.strictEqual(multa, 2000, "Multa FGTS 40% incorreta (5000 * 0.4)");

console.log("✅ Teste Rescisão Completa (Sem justa causa) passou");

console.log("\nTodos os testes passaram com sucesso!");
