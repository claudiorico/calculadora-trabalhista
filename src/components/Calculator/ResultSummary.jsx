import { useState } from 'react';
import Button from '@/components/UI/Button';
import styles from './ResultSummary.module.css';

export default function ResultSummary({ resultado, onReset, onPaymentRequest }) {
  const { resumo } = resultado;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handlePay = async () => {
    if (!email || !email.includes('@')) {
      alert('Por favor, informe um e-mail válido para receber o Memorial em PDF.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Envia o resultado + email para o servidor salvar no store
        body: JSON.stringify({ resultado, email }),
      });
      const data = await res.json();
      if (res.ok) {
        // Passa também o resultado e email para o PixQRCode poder usar após confirmação
        onPaymentRequest({ ...data, resultado, email });
      } else {
        alert(data.error || 'Erro ao gerar PIX');
      }
    } catch (err) {
      alert('Erro de conexão ao gerar PIX');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.summaryContainer}>
      <h2 className={styles.title}>Resumo da sua Rescisão</h2>

      <div className={styles.bigNumber}>
        <span className={styles.label}>Valor Líquido Estimado</span>
        <span className={`text-gradient ${styles.value}`}>{formatCurrency(resumo.liquido)}</span>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailBox}>
          <span className={styles.detailLabel}>Total Bruto</span>
          <span className={styles.detailValue}>{formatCurrency(resumo.bruto)}</span>
        </div>
        <div className={styles.detailBox}>
          <span className={styles.detailLabel}>Descontos (INSS/IRRF)</span>
          <span className={styles.detailValueError}>- {formatCurrency(resumo.descontos)}</span>
        </div>

        {resumo.fgts_saque > 0 && (
          <div className={styles.detailBox}>
            <span className={styles.detailLabel}>Saque do FGTS</span>
            <span className={styles.detailValueInfo}>{formatCurrency(resumo.fgts_saque)}</span>
          </div>
        )}

        {resumo.fgts_multa > 0 && (
          <div className={styles.detailBox}>
            <span className={styles.detailLabel}>Multa Rescisória (Inclusa no Saque)</span>
            <span className={styles.detailValueInfo}>{formatCurrency(resumo.fgts_multa)}</span>
          </div>
        )}
      </div>

      <div className={styles.ctaBox}>
        <h3>Quer ver o cálculo detalhado de cada verba?</h3>
        <p>Acesse o Memorial Completo com todos os descritivos legais, verbas detalhadas e baixe em PDF.</p>

        <div className={styles.emailGroup}>
          <label htmlFor="email-memorial">Seu e-mail (para receber o PDF)</label>
          <input
            id="email-memorial"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.actions}>
          <Button variant="outline" onClick={onReset} disabled={loading}>Refazer Cálculo</Button>
          <Button variant="primary" onClick={handlePay} disabled={loading}>
            {loading ? 'Gerando PIX...' : 'Liberar Memorial Completo (R$ 9,90)'}
          </Button>
        </div>
      </div>
    </div>
  );
}
