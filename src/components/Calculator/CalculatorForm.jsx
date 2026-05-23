'use client';

import { useState } from 'react';
import Button from '@/components/UI/Button';
import styles from './CalculatorForm.module.css';

export default function CalculatorForm({ onCalculate }) {
  const [formData, setFormData] = useState({
    admissao: '',
    demissao: '',
    salario: '',
    motivo: 'sem_justa_causa',
    avisoPrevio: 'indenizado',
    dependentes: '0',
    saldoFGTSInfo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate({
      ...formData,
      salario: parseFloat(formData.salario),
      dependentes: parseInt(formData.dependentes || 0),
      saldoFGTSInfo: formData.saldoFGTSInfo ? parseFloat(formData.saldoFGTSInfo) : null
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.group}>
          <label>Data de Admissão</label>
          <input type="date" name="admissao" required value={formData.admissao} onChange={handleChange} />
        </div>
        <div className={styles.group}>
          <label>Data de Demissão</label>
          <input type="date" name="demissao" required value={formData.demissao} onChange={handleChange} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label>Último Salário Bruto (R$)</label>
          <input type="number" step="0.01" name="salario" required placeholder="0.00" value={formData.salario} onChange={handleChange} />
        </div>
        <div className={styles.group}>
          <label>Dependentes (IRRF)</label>
          <input type="number" name="dependentes" min="0" value={formData.dependentes} onChange={handleChange} />
        </div>
      </div>

      <div className={styles.group}>
        <label>Motivo da Rescisão</label>
        <select name="motivo" value={formData.motivo} onChange={handleChange}>
          <option value="sem_justa_causa">Demissão sem justa causa</option>
          <option value="com_justa_causa">Demissão com justa causa</option>
          <option value="pedido_demissao">Pedido de demissão</option>
          <option value="acordo">Acordo mútuo (Reforma Trabalhista)</option>
          <option value="fim_experiencia">Término de contrato de experiência</option>
        </select>
      </div>

      {formData.motivo !== 'com_justa_causa' && formData.motivo !== 'fim_experiencia' && (
        <div className={styles.group}>
          <label>Aviso Prévio</label>
          <select name="avisoPrevio" value={formData.avisoPrevio} onChange={handleChange}>
            <option value="indenizado">Indenizado (Pago pela empresa)</option>
            <option value="trabalhado">Trabalhado</option>
            {formData.motivo === 'pedido_demissao' && (
              <option value="nao_cumprido">Não cumprido (Descontado)</option>
            )}
          </select>
        </div>
      )}

      <div className={styles.group}>
        <label>Saldo Atual do FGTS (R$) - Opcional</label>
        <input 
          type="number" 
          step="0.01" 
          name="saldoFGTSInfo" 
          placeholder="Ex: 5000.00" 
          value={formData.saldoFGTSInfo} 
          onChange={handleChange} 
        />
        <small className={styles.helpText}>Para uma multa exata, informe o valor que está no seu app do FGTS da Caixa. Se deixar em branco, faremos uma estimativa automática.</small>
      </div>

      <Button type="submit" size="lg" className={styles.submitBtn}>
        Calcular Rescisão
      </Button>
    </form>
  );
}
