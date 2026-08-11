import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  MonitorSmartphone, 
  FileText, 
  Box, 
  Tags, 
  Award, 
  Layers, 
  DollarSign, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  BarChart2, 
  Users 
} from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/', active: true },
  { name: 'Cashier', icon: MonitorSmartphone, href: '/cashier' },
  { name: 'Transaction', icon: FileText, href: '/transaction' },
  { name: 'Master Item', icon: Box, href: '/master-item' },
  { name: 'Category', icon: Tags, href: '/category' },
  { name: 'Brand', icon: Award, href: '/brand' },
  { name: 'Units', icon: Layers, href: '/units' },
  { name: 'Master Price', icon: DollarSign, href: '/master-price' },
  { name: 'Purchase Order', icon: ShoppingCart, href: '/purchase-order' },
  { name: 'Supplier', icon: Truck, href: '/supplier' },
  { name: 'Receipt', icon: Receipt, href: '/receipt' },
  { name: 'Report', icon: BarChart2, href: '/report' },
  { name: 'User Manager', icon: Users, href: '/user-manager' },
];

const inventoryItems = [
  { name: 'Master Item', icon: Box, href: '/inv-master-item' },
  { name: 'Category', icon: Tags, href: '/inv-category' },
  { name: 'Brand', icon: Award, href: '/inv-brand' },
  { name: 'Units', icon: Layers, href: '/inv-units' },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <Image 
            src="/logo.png" 
            alt="Colegio De Santa Rita Logo" 
            width={48} 
            height={48}
            className={styles.logoImage}
            priority
          />
        </div>
        <div className={styles.logoText}>
          <h2>COLEGIO DE SANTA RITA</h2>
          <p>Point of Sales</p>
        </div>
      </div>

      <div className={styles.scrollArea}>
        <nav className={styles.navGroup}>
          <ul className={styles.navList}>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index} className={styles.navItem}>
                  <Link 
                    href={item.href} 
                    className={`${styles.navLink} ${item.active ? styles.active : ''}`}
                  >
                    <Icon className={styles.navIcon} size={20} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.navGroup}>
          <h3 className={styles.groupLabel}>INVENTORY</h3>
          <ul className={styles.navList}>
            {inventoryItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index} className={styles.navItem}>
                  <Link href={item.href} className={styles.navLink}>
                    <Icon className={styles.navIcon} size={20} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
