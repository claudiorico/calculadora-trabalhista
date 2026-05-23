import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className="text-gradient">Rescisão</span>Online
        </Link>
        <nav className={styles.nav}>
          <Link href="#como-funciona" className={styles.link}>Como Funciona</Link>
          <Link href="/admin" className={styles.link}>Área Restrita</Link>
        </nav>
      </div>
    </header>
  );
}
