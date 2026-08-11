import React from 'react';
import styles from './page.module.css';
import StatCards from '@/components/StatCards';
import SalesChart from '@/components/SalesChart';
import LatestTransaction from '@/components/LatestTransaction';
import PopularProduct from '@/components/PopularProduct';
import StockReceipt from '@/components/StockReceipt';

export default function Home() {
  return (
    <div className={styles.dashboardContainer}>
      {/* 4 Stat Cards */}
      <section className={styles.statsSection}>
        <StatCards />
      </section>

      {/* Main Chart */}
      <section className={styles.chartSection}>
        <SalesChart />
      </section>

      {/* Bottom Widgets */}
      <section className={styles.bottomWidgets}>
        <div className={styles.widgetWrapper}>
          <LatestTransaction />
        </div>
        <div className={styles.widgetWrapper}>
          <PopularProduct />
        </div>
        <div className={styles.widgetWrapper}>
          <StockReceipt />
        </div>
      </section>
    </div>
  );
}
