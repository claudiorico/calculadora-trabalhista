/**
 * Store persistido em /tmp para sessões de cálculo.
 *
 * Por que /tmp?
 * - O Vercel mantém instâncias "quentes" por alguns minutos entre requests.
 *   Um Map in-memory se perde quando a instância esfria (cold start).
 * - /tmp é o único diretório gravável em ambientes serverless (Vercel, Lambda, etc.)
 *   e persiste dentro de uma mesma instância aquecida.
 * - É suficiente para o fluxo: criar PIX → pagar → webhook confirmar → polling detectar.
 *   O tempo total desse fluxo raramente passa de 5 minutos.
 *
 * Em produção de longo prazo, substituir pelo Supabase.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const STORE_PATH = join('/tmp', 'calc_store.json');

function readStore() {
  try {
    if (existsSync(STORE_PATH)) {
      return JSON.parse(readFileSync(STORE_PATH, 'utf8'));
    }
  } catch {
    // arquivo corrompido ou sem permissão — começa do zero
  }
  return {};
}

function writeStore(data) {
  try {
    writeFileSync(STORE_PATH, JSON.stringify(data), 'utf8');
  } catch (e) {
    console.error('[calcStore] Erro ao gravar store:', e.message);
  }
}

/**
 * Salva os dados de um cálculo.
 */
export function saveCalc(calcId, data) {
  const store = readStore();
  store[calcId] = { ...data, status: 'pending' };
  writeStore(store);
}

/**
 * Busca os dados de um cálculo pelo calcId.
 */
export function getCalc(calcId) {
  const store = readStore();
  return store[calcId] || null;
}

/**
 * Marca um cálculo como pago.
 */
export function markAsPaid(calcId) {
  const store = readStore();
  if (store[calcId]) {
    store[calcId] = { ...store[calcId], status: 'confirmed' };
    writeStore(store);
  }
}

/**
 * Busca pelo paymentId do Asaas (externalReference).
 */
export function getCalcByPaymentId(paymentId) {
  const store = readStore();
  for (const [calcId, data] of Object.entries(store)) {
    if (data.paymentId === paymentId) {
      return { calcId, ...data };
    }
  }
  return null;
}
