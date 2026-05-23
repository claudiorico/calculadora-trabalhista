import { renderToBuffer } from '@react-pdf/renderer';
import { MemorialPDF } from '@/components/PDF/MemorialPDF';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Gera o PDF do memorial em memória (Buffer) e envia por e-mail via Resend
 */
export async function sendMemorialEmail(customerEmail, calcId, resultadoData) {
  try {
    // 1. Gera o PDF em buffer
    console.log(`Gerando PDF para o cálculo ${calcId}...`);
    // Precisamos instanciar o componente React
    const pdfBuffer = await renderToBuffer(<MemorialPDF resultado={resultadoData} calcId={calcId} />);
    
    // 2. Prepara o anexo
    const attachments = [
      {
        filename: `Memorial_Rescisao_${calcId}.pdf`,
        content: pdfBuffer,
      }
    ];

    console.log(`Enviando e-mail para ${customerEmail}...`);
    // 3. Dispara o e-mail via Resend
    // Nota: Como estamos no plano gratuito, o "from" precisa ser do domínio do Resend ou configurado.
    // O Resend permite envios a partir de 'onboarding@resend.dev' para o SEU email cadastrado.
    // Para enviar para outros clientes, é necessário configurar um domínio próprio no painel.
    const data = await resend.emails.send({
      from: 'Calculadora Trabalhista <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Seu Memorial de Cálculo Trabalhista Completo - #${calcId}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>Olá! O seu pagamento foi confirmado. 🎉</h2>
          <p>Obrigado por utilizar a nossa Calculadora Trabalhista. O seu <strong>Memorial de Cálculo Completo</strong> está em anexo neste e-mail no formato PDF.</p>
          <p>Nesse documento você encontra:</p>
          <ul>
            <li>Detalhamento de Proventos</li>
            <li>Memória de Cálculo de Descontos (INSS/IRRF)</li>
            <li>Estimativa exata da Multa e Saque do FGTS</li>
          </ul>
          <p>Se tiver qualquer dúvida, procure a assessoria de um advogado especialista.</p>
          <br />
          <p>Atenciosamente,<br /><strong>Equipe Rescisão Online</strong></p>
        </div>
      `,
      attachments
    });

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao gerar PDF e enviar E-mail:", error);
    return { success: false, error: error.message };
  }
}
