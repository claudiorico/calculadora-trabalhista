import { NextResponse } from 'next/server';
import { createPixCharge } from '@/lib/asaas';
import { saveCalc } from '@/lib/calcStore';
import crypto from 'crypto';

// QR Code de exemplo (1x1 pixel transparente em base64) usado no modo mock.
// Em dev, substituímos por um QR Code real gerado localmente.
const MOCK_QR_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QA/wD/AP+gvaeTAAABuklEQVR4nO3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBuAABHgAAAABJRU5ErkJggg==';

const MOCK_QR_PAYLOAD =
  '00020126580014br.gov.bcb.pix0136SIMULADO-TESTE-CALCULADORA-TRABALHISTA5204000053039865802BR5925CALCULADORA TRABALHISTA6009SAO PAULO62070503***6304MOCK';

function isMockMode() {
  // Ativa modo mock se: variável de ambiente definida OU chave Asaas ausente
  return (
    process.env.MOCK_PAYMENT === 'true' ||
    !process.env.ASAAS_API_KEY ||
    process.env.ASAAS_API_KEY === 'sua_chave_aqui'
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { resultado, email } = body;

    if (!resultado) {
      return NextResponse.json({ error: 'Dados do cálculo não fornecidos' }, { status: 400 });
    }

    const calcId = crypto.randomUUID();
    const mockMode = isMockMode();

    console.log(`[Pagamento] calcId=${calcId} | email=${email} | mock=${mockMode}`);

    let pixData;

    if (mockMode) {
      // ── MODO SIMULAÇÃO ──────────────────────────────────────────────
      // Não chama o Asaas. Retorna dados falsos para testar o fluxo UI.
      console.log('[Pagamento] Modo mock ativo — usando QR Code simulado.');
      pixData = {
        success: true,
        paymentId: `mock_${calcId}`,
        qrCodePayload: MOCK_QR_PAYLOAD,
        qrCodeImage: MOCK_QR_BASE64,
      };
    } else {
      // ── MODO REAL ───────────────────────────────────────────────────
      pixData = await createPixCharge(calcId, 9.90);

      if (!pixData.success) {
        console.error('[Pagamento] Falha no Asaas:', pixData.error);
        return NextResponse.json(
          { error: `Falha ao gerar cobrança PIX: ${pixData.error}` },
          { status: 500 }
        );
      }
    }

    // Salva no store (persiste em /tmp)
    saveCalc(calcId, {
      resultado,
      email: email || '',
      paymentId: pixData.paymentId,
      mock: mockMode,
    });

    return NextResponse.json({
      calcId,
      paymentId: pixData.paymentId,
      qrCodePayload: pixData.qrCodePayload,
      qrCodeImage: pixData.qrCodeImage,
      mock: mockMode,
    });

  } catch (error) {
    console.error('[Pagamento] Erro no endpoint:', error);
    return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 });
  }
}
