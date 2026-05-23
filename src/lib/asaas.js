/**
 * Cliente da API do Asaas para geração de cobranças PIX
 */

const ASAAS_URL = process.env.ASAAS_API_URL;
const ASAAS_KEY = process.env.ASAAS_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'access_token': ASAAS_KEY
};

/**
 * Cria um cliente genérico (Customer) no Asaas se necessário, 
 * ou retorna um existente. Como a calculadora não exige cadastro prévio,
 * podemos criar um cliente temporário genérico para anexar a cobrança,
 * ou pedir apenas o nome/email do usuário antes do pagamento.
 * Para simplificar e manter a conversão alta, criaremos a cobrança
 * vinculada a um "Cliente Avulso".
 */
export async function createPixCharge(calcId, valor = 9.90) {
  try {
    // Passo 1: Criar/Buscar cliente (Necessário no Asaas)
    // Na prática, em produção, você criaria um cliente genérico uma vez e reutilizaria o ID,
    // ou capturaria o nome/cpf do usuário. Vamos criar um temporário para este cálculo.
    const customerRes = await fetch(`${ASAAS_URL}/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Usuário Calculadora Trabalhista',
        email: `usuario_${calcId}@rescisaoonline.com.br` // Email falso rastreável
      })
    });
    
    if (!customerRes.ok) throw new Error('Falha ao criar cliente no Asaas');
    const customer = await customerRes.json();

    // Passo 2: Criar a cobrança (PIX)
    const chargeRes = await fetch(`${ASAAS_URL}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: customer.id,
        billingType: 'PIX',
        value: valor,
        dueDate: new Date().toISOString().split('T')[0], // Vence hoje
        description: `Memorial Completo - Cálculo Trabalhista #${calcId}`,
        externalReference: calcId // Importante para o webhook identificar
      })
    });

    if (!chargeRes.ok) throw new Error('Falha ao gerar cobrança PIX');
    const charge = await chargeRes.json();

    // Passo 3: Obter o QR Code (Payload e Imagem Base64)
    const qrCodeRes = await fetch(`${ASAAS_URL}/payments/${charge.id}/pixQrCode`, {
      method: 'GET',
      headers
    });
    
    if (!qrCodeRes.ok) throw new Error('Falha ao obter QR Code');
    const qrCode = await qrCodeRes.json();

    return {
      success: true,
      paymentId: charge.id,
      qrCodePayload: qrCode.payload, // O código "Copia e Cola"
      qrCodeImage: qrCode.encodedImage // O QR Code em Base64 para exibir na tela
    };

  } catch (error) {
    console.error("Erro na API do Asaas:", error);
    return { success: false, error: error.message };
  }
}
