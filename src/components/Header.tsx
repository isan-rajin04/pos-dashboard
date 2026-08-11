import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.titleContainer}>
        <h1 className={styles.pageTitle}>DASHBOARD</h1>
      </div>

      <div className={styles.rightSection}>
        <nav className={styles.breadcrumbs}>
          <a href="#" className={styles.breadcrumbItem}>General</a>
          <a href="#" className={styles.breadcrumbItem}>Inventory</a>
          <a href="#" className={styles.breadcrumbItem}>Cashier</a>
          <div className={styles.breadcrumbItem}>
            <span>2024</span>
            <ChevronDown size={14} />
          </div>
        </nav>

        <div className={styles.divider} />

        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Jhony Soda</span>
            <span className={styles.userRole}>Administrator</span>
          </div>
          <div className={styles.avatar}>
            JS
            <span className={styles.onlineIndicator}></span>
          </div>
        </div>
      </div>
    </header>
  );
}
