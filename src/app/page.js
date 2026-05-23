'use client';

import { useState } from 'react';
import Header from '@/components/UI/Header';
import Footer from '@/components/UI/Footer';
import CalculatorForm from '@/components/Calculator/CalculatorForm';
import ResultSummary from '@/components/Calculator/ResultSummary';
import ResultComplete from '@/components/Calculator/ResultComplete';
import PixQRCode from '@/components/Payment/PixQRCode';
import { calcularRescisao } from '@/lib/calculos';
import styles from './page.module.css';

export default function Home() {
  const [resultado, setResultado] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  // Guarda o resultado + calcId após pagamento confirmado
  const [paidData, setPaidData] = useState(null);

  const handleCalculate = (data) => {
    const res = calcularRescisao(data);
    setResultado(res);
    setPaidData(null);
  };

  const handleReset = () => {
    setResultado(null);
    setPaymentData(null);
    setPaidData(null);
  };

  const handlePaymentRequest = (data) => {
    // data = { calcId, paymentId, qrCodePayload, qrCodeImage, resultado, email }
    setPaymentData(data);
  };

  const handlePaymentConfirmed = (confirmedResultado) => {
    // Pagamento confirmado pelo polling: esconde o QR e mostra o memorial completo
    setPaidData({ resultado: confirmedResultado, calcId: paymentData?.calcId });
    setPaymentData(null);
  };

  // Determina qual tela exibir
  const renderContent = () => {
    if (paidData) {
      return (
        <ResultComplete
          resultado={paidData.resultado}
          calcId={paidData.calcId}
          onReset={handleReset}
        />
      );
    }

    if (paymentData) {
      return (
        <PixQRCode
          payload={paymentData.qrCodePayload}
          base64Image={paymentData.qrCodeImage}
          calcId={paymentData.calcId}
          resultado={paymentData.resultado}
          onCancel={() => setPaymentData(null)}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      );
    }

    if (resultado) {
      return (
        <ResultSummary
          resultado={resultado}
          onReset={handleReset}
          onPaymentRequest={handlePaymentRequest}
        />
      );
    }

    return <CalculatorForm onCalculate={handleCalculate} />;
  };

  return (
    <>
      <Header />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>Atualizado para 2026</div>
            <h1 className={styles.title}>
              Descubra o valor exato da sua <span className="text-gradient">rescisão</span>
            </h1>
            <p className={styles.subtitle}>
              Calcule seu acerto trabalhista em segundos. Simples, rápido e de acordo com as leis mais recentes (incluindo isenção IRRF).
            </p>
          </div>

          <div className={`glass-panel ${styles.calculatorContainer}`}>
            {renderContent()}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
