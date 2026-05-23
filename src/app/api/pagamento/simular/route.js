/**
 * POST /api/pagamento/simular
 *
 * Endpoint exclusivo para testes — simula a confirmação de pagamento
 * que normalmente viria do webhook do Asaas.
 *
 * Uso: { calcId: "uuid-do-calculo" }
 *
 * O que faz:
 *  1. Marca o cálculo como "confirmed" no store (o polling do front detecta)
 *  2. Gera o PDF e envia o e-mail (mesmo fluxo do webhook real)
 *
 * Só funciona se MOCK_PAYMENT=true ou se não houver chave Asaas configurada.
 */

import { NextResponse } from 'next/server';
import { getCalc, markAsPaid } from '@/lib/calcStore';
import { sendMemorialEmail } from '@/lib/pdfEmailService';

function isMockMode() {
  return (
    process.env.MOCK_PAYMENT === 'true' ||
    !process.env.ASAAS_API_KEY ||
    process.env.ASAAS_API_KEY === 'sua_chave_aqui'
  );
}

export async function POST(request) {
  if (!isMockMode()) {
    return NextResponse.json(
      { error: 'Simulação disponível apenas em modo de teste (MOCK_PAYMENT=true).' },
      { status: 403 }
    );
  }

  try {
    const { calcId } = await request.json();

    if (!calcId) {
      return NextResponse.json({ error: 'calcId não informado' }, { status: 400 });
    }

    const entry = getCalc(calcId);
    if (!entry) {
      return NextResponse.json({ error: `Cálculo ${calcId} não encontrado no store.` }, { status: 404 });
    }

    console.log(`[Simular] Simulando pagamento confirmado para calcId=${calcId}`);

    // 1. Marca como pago (o polling do front vai detectar isso)
    markAsPaid(calcId);

    // 2. Envia o e-mail com PDF (se houver e-mail)
    let emailStatus = 'sem e-mail informado';
    if (entry.email) {
      const result = await sendMemorialEmail(entry.email, calcId, entry.resultado);
      emailStatus = result.success ? `e-mail enviado para ${entry.email}` : `erro: ${result.error}`;
      console.log(`[Simular] ${emailStatus}`);
    }

    return NextResponse.json({
      success: true,
      calcId,
      status: 'confirmed',
      emailStatus,
    });

  } catch (error) {
    console.error('[Simular] Erro:', error);
    return NextResponse.json({ error: 'Erro interno na simulação' }, { status: 500 });
  }
}
