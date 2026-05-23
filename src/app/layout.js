import './globals.css';

export const metadata = {
  title: 'Calculadora Trabalhista Online | Rescisão Fácil e Precisa',
  description: 'Calcule rapidamente o valor da sua rescisão trabalhista. Saiba quanto você tem a receber de saldo de salário, aviso prévio, férias, 13º e multa do FGTS.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
