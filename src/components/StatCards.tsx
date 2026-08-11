import React from 'react';
import { Briefcase, Wallet, ClipboardList, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './StatCards.module.css';

const statsData = [
  {
    title: 'Today Gross Profit',
    value: '$23,560,000',
    trend: '8.5% Up from yesterday',
    isPositive: true,
    icon: Briefcase,
    iconBg: '#FCECEC', // Light red
    iconColor: '#9B59B6', // Purple-ish brown
    actionBadge: 'blue'
  },
  {
    title: 'Today Net Profit',
    value: '$3,560,000',
    trend: '8.5% Up from yesterday',
    isPositive: true,
    icon: Wallet,
    iconBg: '#FFF3E0', // Light orange
    iconColor: '#E67E22', // Orange
    actionBadge: 'red'
  },
  {
    title: 'Today Item Receipt',
    value: '$1,500,350',
    trend: '8.5% Up from yesterday',
    isPositive: true,
    icon: ClipboardList,
    iconBg: '#F4F6F9',
    iconColor: '#95A5A6',
    actionBadge: 'blue'
  },
  {
    title: 'Today Estimation Loss',
    value: '$35,000',
    trend: '8.5% Down from yesterday',
    isPositive: false,
    icon: TrendingDown,
    iconBg: '#FCECEC',
    iconColor: '#E74C3C',
    actionBadge: 'red'
  }
];

export default function StatCards() {
  return (
    <div className={styles.cardsGrid}>
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={styles.card}>
            <div className={styles.cardHeader}>
              <div 
                className={styles.iconWrapper} 
                style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
              >
                <Icon size={24} />
              </div>
              <div className={`${styles.actionBadge} ${styles[stat.actionBadge]}`}>
                {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.title}>{stat.title}</h3>
              <p className={styles.value}>{stat.value}</p>
              <div className={`${styles.trend} ${stat.isPositive ? styles.positive : styles.negative}`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{stat.trend}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
