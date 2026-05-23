import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const btnClass = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;
  
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}
