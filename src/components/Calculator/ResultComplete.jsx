'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Button from '@/components/UI/Button';
import styles from './ResultComplete.module.css';
import { MemorialPDF } from '@/components/PDF/MemorialPDF';

// PDFDownloadLink precisa de 'use client' e não pode ser renderizado no servidor
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <Button variant="primary" disabled>Preparando PDF...</Button> }
);

export default function ResultComplete({ resultado, calcId = '0000', onReset }) {
  const { verbas, descontos, resumo } = resultado;
  const [showConfetti, setShowConfetti] = useState(true);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badgeSuccess}>✓ Pagamento Confirmado</div>
        <h2 className={styles.title}>Memorial de Cálculo Completo</h2>
        <p className={styles.subtitle}>
          Confira abaixo o detalhamento de todas as suas verbas rescisórias e descontos legais aplicados.
          O PDF também foi enviado para o seu e-mail.
        </p>
      </div>

      <div className={styles.tableContainer}>
        <h3 className={styles.sectionTitle}>1. Verbas a Receber (Proventos)</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Descrição da Verba</th>
              <th className={styles.amountCol}>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {verbas.map((v, i) => (
              <tr key={i}>
                <td>{v.nome}</td>
                <td className={styles.amountCol}>{formatCurrency(v.valor)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total de Proventos</strong></td>
              <td className={styles.amountCol}><strong>{formatCurrency(resumo.bruto)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={styles.tableContainer}>
        <h3 className={styles.sectionTitle}>2. Descontos Legais (Deduções)</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Descrição do Desconto</th>
              <th className={styles.amountCol}>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {descontos.length > 0 ? descontos.map((d, i) => (
              <tr key={i} className={styles.discountRow}>
                <td>{d.nome}</td>
                <td className={styles.amountCol}>- {formatCurrency(d.valor)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="2" className={styles.emptyRow}>Nenhum desconto aplicável (Isenção IRRF/INSS)</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total de Descontos</strong></td>
              <td className={`${styles.amountCol} ${styles.textDanger}`}>
                <strong>- {formatCurrency(resumo.descontos)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={styles.summaryBox}>
        <div className={styles.summaryItem}>
          <span>Líquido a Receber (Empresa Paga):</span>
          <span className={styles.totalLiquid}>{formatCurrency(resumo.liquido)}</span>
        </div>
      </div>

      <div className={styles.fgtsSection}>
        <h3 className={styles.sectionTitle}>3. FGTS e Multa Rescisória</h3>
        <div className={styles.fgtsGrid}>
          <div className={styles.fgtsCard}>
            <span className={styles.fgtsLabel}>Multa de 40% (ou 20%)</span>
            <span className={styles.fgtsValue}>{formatCurrency(resumo.fgts_multa)}</span>
            <small>Depositado pela empresa na sua conta CAIXA</small>
          </div>
          <div className={styles.fgtsCard}>
            <span className={styles.fgtsLabel}>Valor Total p/ Saque</span>
            <span className={styles.fgtsValueHighlight}>{formatCurrency(resumo.fgts_saque)}</span>
            <small>Saldo existente + Multa</small>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={onReset}>Fazer Novo Cálculo</Button>

        {/* Download do PDF gerado diretamente no browser via @react-pdf/renderer */}
        <PDFDownloadLink
          document={<MemorialPDF resultado={resultado} calcId={calcId} />}
          fileName={`Memorial_Rescisao_${calcId}.pdf`}
        >
          {({ loading, error }) =>
            error ? (
              <Button variant="primary" disabled>Erro ao gerar PDF</Button>
            ) : (
              <Button variant="primary" disabled={loading}>
                {loading ? 'Preparando PDF...' : 'Baixar PDF Oficial'}
              </Button>
            )
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
}
