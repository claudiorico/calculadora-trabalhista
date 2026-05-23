'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/UI/Button';
import styles from './PixQRCode.module.css';

const POLL_INTERVAL_MS = 3000;

export default function PixQRCode({ payload, base64Image, calcId, resultado, mock, onCancel, onPaymentConfirmed }) {
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const intervalRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Polling: verifica status a cada 3 segundos
  useEffect(() => {
    if (!calcId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/pagamento/status?calcId=${calcId}`);
        const data = await res.json();
        if (data.status === 'confirmed') {
          clearInterval(intervalRef.current);
          onPaymentConfirmed(resultado);
        }
      } catch (err) {
        console.warn('[PixQRCode] Erro ao verificar status:', err);
      }
    };

    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [calcId, resultado, onPaymentConfirmed]);

  // Botão de simulação: chama o endpoint /simular que faz o mesmo que o webhook real
  const handleSimular = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/pagamento/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calcId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Erro na simulação: ${data.error}`);
      }
      // O polling vai detectar o status "confirmed" e chamar onPaymentConfirmed automaticamente
    } catch (err) {
      alert('Erro de conexão ao simular pagamento.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Liberar Memorial Completo</h3>
      <p className={styles.subtitle}>
        Escaneie o QR Code abaixo no app do seu banco para pagar <strong>R$ 9,90</strong> e liberar o resultado completo imediatamente.
      </p>

      <div className={styles.qrCodeWrapper}>
        <img
          src={`data:image/png;base64,${base64Image}`}
          alt="QR Code PIX"
          className={styles.qrImage}
        />
      </div>

      <div className={styles.copySection}>
        <p>Ou use o PIX Copia e Cola:</p>
        <div className={styles.inputGroup}>
          <input type="text" value={payload} readOnly className={styles.payloadInput} />
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
      </div>

      <div className={styles.statusSection}>
        <div className={styles.loader}></div>
        <p>Aguardando confirmação do pagamento...</p>
      </div>

      {/* Botão de simulação — visível apenas em modo mock/teste */}
      {mock && (
        <div className={styles.mockSection}>
          <p className={styles.mockLabel}>⚠️ Modo de Teste Ativo</p>
          <Button variant="primary" onClick={handleSimular} disabled={simulating}>
            {simulating ? 'Simulando...' : '✓ Simular Pagamento Confirmado'}
          </Button>
        </div>
      )}

      <Button variant="outline" className={styles.cancelBtn} onClick={onCancel}>
        Voltar
      </Button>
    </div>
  );
}
