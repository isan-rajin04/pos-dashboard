import React from 'react';
import styles from './StockReceipt.module.css';

const records = [
  { timestamp: 'Today - 12:45', name: 'Rhinotomy machine', subname: 'x250', event: 'In' },
  { timestamp: 'Today - 12:45', name: 'Asus X541U', subname: '', event: 'Out' },
];

export default function StockReceipt() {
  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>Stock Receipt / Issued</h3>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Item Name</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td className={styles.cellMuted}>{record.timestamp}</td>
                <td>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemIcon}>
                      {/* Image placeholder */}
                    </div>
                    <div className={styles.itemText}>
                      <span className={styles.name}>{record.name}</span>
                      {record.subname && <span className={styles.subname}>{record.subname}</span>}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${record.event === 'In' ? styles.badgeIn : styles.badgeOut}`}>
                    {record.event}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
