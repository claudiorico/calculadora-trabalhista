import { NextResponse } from 'next/server';
import { getCalc } from '@/lib/calcStore';

/**
 * GET /api/pagamento/status?calcId=xxx
 * Retorna o status do pagamento para que o front-end faça polling.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const calcId = searchParams.get('calcId');

    if (!calcId) {
      return NextResponse.json({ error: 'calcId não informado' }, { status: 400 });
    }

    const entry = getCalc(calcId);

    if (!entry) {
      return NextResponse.json({ status: 'pending' });
    }

    return NextResponse.json({ status: entry.status });

  } catch (error) {
    console.error('[Status] Erro:', error);
    return NextResponse.json({ error: 'Erro ao verificar status' }, { status: 500 });
  }
}
