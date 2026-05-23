import { NextResponse } from 'next/server';
import { getCalc, markAsPaid } from '@/lib/calcStore';
import { sendMemorialEmail } from '@/lib/pdfEmailService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { event, payment } = body;

    console.log('[Webhook] Evento recebido:', event);

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      // O Asaas devolve o calcId no campo externalReference
      const calcId = payment.externalReference;

      if (!calcId) {
        console.warn('[Webhook] externalReference ausente no pagamento.');
        return NextResponse.json({ success: true, message: 'Sem referência de cálculo' });
      }

      console.log(`[Webhook] Pagamento confirmado para o cálculo: ${calcId}`);

      // 1. Busca os dados reais do store in-memory
      const calcEntry = getCalc(calcId);

      if (!calcEntry) {
        console.warn(`[Webhook] Cálculo ${calcId} não encontrado no store.`);
        return NextResponse.json({ success: true, message: 'Cálculo não encontrado no store' });
      }

      const { resultado, email } = calcEntry;

      // 2. Marca como pago no store (o polling do front-end vai detectar isso)
      markAsPaid(calcId);
      console.log(`[Webhook] Cálculo ${calcId} marcado como pago.`);

      // 3. Gera o PDF e envia o e-mail (se o usuário informou um e-mail)
      if (email) {
        const emailResult = await sendMemorialEmail(email, calcId, resultado);

        if (!emailResult.success) {
          console.error('[Webhook] Erro ao enviar e-mail:', emailResult.error);
          // Não retornamos 500 para não fazer o Asaas reenviar o webhook infinitamente
        } else {
          console.log(`[Webhook] E-mail enviado com sucesso para ${email}`);
        }
      } else {
        console.log('[Webhook] Nenhum e-mail informado, pulando envio.');
      }

      return NextResponse.json({ success: true, message: 'Webhook processado com sucesso' });
    }

    return NextResponse.json({ success: true, message: 'Evento ignorado' });

  } catch (error) {
    console.error('[Webhook] Erro ao processar:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
