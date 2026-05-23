import { NextResponse } from 'next/server';
import { createPixCharge } from '@/lib/asaas';
import { saveCalc } from '@/lib/calcStore';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { resultado, email } = body;

    if (!resultado) {
      return NextResponse.json({ error: 'Dados do cálculo não fornecidos' }, { status: 400 });
    }

    const calcId = crypto.randomUUID();

    console.log('[Pagamento] Gerando cobrança PIX para o cálculo:', calcId, '| E-mail:', email);

    // Gera a cobrança Asaas
    const pixData = await createPixCharge(calcId, 9.90);

    if (!pixData.success) {
      return NextResponse.json({ error: pixData.error }, { status: 500 });
    }

    // Salva os dados no store in-memory para o webhook recuperar depois
    saveCalc(calcId, {
      resultado,
      email: email || '',
      paymentId: pixData.paymentId,
    });

    return NextResponse.json({
      calcId,
      paymentId: pixData.paymentId,
      qrCodePayload: pixData.qrCodePayload,
      qrCodeImage: pixData.qrCodeImage,
    });

  } catch (error) {
    console.error('[Pagamento] Erro no endpoint:', error);
    return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 });
  }
}
