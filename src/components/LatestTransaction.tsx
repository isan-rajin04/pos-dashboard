import React from 'react';
import styles from './LatestTransaction.module.css';

const transactions = [
  { id: 'T21.0331', timestamp: 'Today - 12:45', amount: '$50,000', status: 'Succeed' },
  { id: 'T21.0331', timestamp: 'Today - 12:31', amount: '$150,000', status: 'Succeed' },
];

export default function LatestTransaction() {
  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>Latest Transaction</h3>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Timestamp</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td className={styles.cellId}>{tx.id}</td>
                <td className={styles.cellMuted}>{tx.timestamp}</td>
                <td className={styles.cellAmount}>{tx.amount}</td>
                <td>
                  <span className={styles.badgeSucceed}>{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
