/**
 * Store in-memory para sessões de cálculo.
 * Guarda resultado, email, paymentId e status enquanto o servidor está rodando.
 * Em produção, isso seria substituído pelo Supabase.
 */

const store = new Map();

/**
 * Salva os dados de um cálculo.
 * @param {string} calcId
 * @param {{ resultado: object, email: string, paymentId: string, status: string }} data
 */
export function saveCalc(calcId, data) {
  store.set(calcId, { ...data, status: 'pending' });
}

/**
 * Busca os dados de um cálculo pelo calcId.
 * @param {string} calcId
 */
export function getCalc(calcId) {
  return store.get(calcId) || null;
}

/**
 * Marca um cálculo como pago.
 * @param {string} calcId
 */
export function markAsPaid(calcId) {
  const entry = store.get(calcId);
  if (entry) {
    store.set(calcId, { ...entry, status: 'confirmed' });
  }
}

/**
 * Busca o calcId a partir de um paymentId do Asaas (externalReference).
 * O Asaas devolve o calcId no campo externalReference do webhook,
 * então este método é um atalho para consistência.
 * @param {string} paymentId
 */
export function getCalcByPaymentId(paymentId) {
  for (const [calcId, data] of store.entries()) {
    if (data.paymentId === paymentId) {
      return { calcId, ...data };
    }
  }
  return null;
}
