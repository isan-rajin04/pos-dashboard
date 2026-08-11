import React from 'react';
import styles from './PopularProduct.module.css';
import { Image as ImageIcon } from 'lucide-react';

const products = [
  { id: 'PZ.31547', name: 'Rhinotomy machine', subname: 'x250', stock: 14 },
  { id: 'PZ.31721', name: 'Laptop Asus x249', subname: '', stock: 14 },
];

export default function PopularProduct() {
  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>Popular Product</h3>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Item Name</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod, index) => (
              <tr key={index}>
                <td className={styles.cellId}>{prod.id}</td>
                <td>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemIcon}>
                      {/* Image placeholder */}
                    </div>
                    <div className={styles.itemText}>
                      <span className={styles.name}>{prod.name}</span>
                      {prod.subname && <span className={styles.subname}>{prod.subname}</span>}
                    </div>
                  </div>
                </td>
                <td className={styles.cellStock}>{prod.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
