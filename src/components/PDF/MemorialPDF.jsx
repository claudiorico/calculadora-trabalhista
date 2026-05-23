import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Opicional: Registrar fontes se necessário (usando fontes padrão por enquanto)

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5', // Primary indigo
    marginTop: 20,
    marginBottom: 10,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
  },
  tableCol: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  tableCellAmount: {
    margin: 5,
    fontSize: 10,
    textAlign: 'right',
  },
  discountText: {
    color: '#ef4444',
  },
  summaryBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  }
});

const formatCurrency = (value) => {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`;
};

export const MemorialPDF = ({ resultado, customerName = "Usuário", calcId = "0000" }) => {
  const { verbas, descontos, resumo } = resultado;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Memorial de Cálculo Trabalhista</Text>
          <Text style={styles.subtitle}>Documento de Referência Extrajudicial | ID: #{calcId}</Text>
          <Text style={styles.subtitle}>Gerado para: {customerName}</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>1. Verbas a Receber (Proventos)</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Descrição</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Valor</Text></View>
            </View>
            {verbas.map((v, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{v.nome}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCellAmount}>{formatCurrency(v.valor)}</Text></View>
              </View>
            ))}
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Total Bruto</Text></View>
              <View style={styles.tableCol}><Text style={[styles.tableCellAmount, { fontWeight: 'bold' }]}>{formatCurrency(resumo.bruto)}</Text></View>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>2. Descontos Legais</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Descrição</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Valor</Text></View>
            </View>
            {descontos.length > 0 ? descontos.map((d, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{d.nome}</Text></View>
                <View style={styles.tableCol}><Text style={[styles.tableCellAmount, styles.discountText]}>- {formatCurrency(d.valor)}</Text></View>
              </View>
            )) : (
              <View style={styles.tableRow}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Nenhum desconto aplicável</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCellAmount}>-</Text></View>
              </View>
            )}
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Total Descontos</Text></View>
              <View style={styles.tableCol}><Text style={[styles.tableCellAmount, styles.discountText, { fontWeight: 'bold' }]}>- {formatCurrency(resumo.descontos)}</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Líquido a Receber (Acerto): {formatCurrency(resumo.liquido)}</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>3. Informações do FGTS</Text>
          <Text style={styles.subtitle}>Saque Previsto (Saldo + Multa): {formatCurrency(resumo.fgts_saque)}</Text>
          <Text style={styles.subtitle}>Multa Rescisória Inclusa: {formatCurrency(resumo.fgts_multa)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Este documento é uma estimativa baseada nas informações fornecidas e não tem valor legal obrigatório perante a Justiça do Trabalho. As alíquotas aplicadas estão de acordo com as regras de 2026.</Text>
        </View>
      </Page>
    </Document>
  );
};
