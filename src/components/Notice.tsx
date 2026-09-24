import type { ReactNode } from 'react';
import { AlertIcon, InfoIcon } from './icons';
import styles from './Notice.module.css';

interface NoticeProps {
  variant: 'warning' | 'error' | 'info';
  title?: string;
  children: ReactNode;
}

/** Anlam yalnızca renkle değil, simge ve metinle de verilir. */
export function Notice({ variant, title, children }: NoticeProps) {
  const Icon = variant === 'info' ? InfoIcon : AlertIcon;
  return (
    <div className={`${styles.notice} ${styles[variant]}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon className={styles.icon} />
      <div>
        {title && <p className={styles.title}>{title}</p>}
        <p className={styles.body}>{children}</p>
      </div>
    </div>
  );
}
