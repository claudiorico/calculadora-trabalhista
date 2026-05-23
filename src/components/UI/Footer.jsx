import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.info}>
          <div className={styles.logo}>
            <span className="text-gradient">Rescisão</span>Online
          </div>
          <p className={styles.text}>
            Cálculos trabalhistas simplificados e atualizados com as leis de {currentYear}.
          </p>
        </div>
        <div className={styles.links}>
          <a href="#" className={styles.link}>Termos de Uso</a>
          <a href="#" className={styles.link}>Política de Privacidade</a>
          <a href="#" className={styles.link}>Contato</a>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {currentYear} RescisãoOnline. Todos os direitos reservados.</p>
        <p className={styles.disclaimer}>
          Esta calculadora fornece uma estimativa baseada nas informações fornecidas. Para cálculos oficiais, consulte um contador ou advogado trabalhista.
        </p>
      </div>
    </footer>
  );
}
