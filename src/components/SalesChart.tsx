"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import styles from './SalesChart.module.css';

const data = [
  { time: '00:00', value: 100 },
  { time: '02:00', value: 180 },
  { time: '04:00', value: 150 },
  { time: '06:00', value: 220 },
  { time: '08:00', value: 380 },
  { time: '10:00', value: 420 },
  { time: '12:00', value: 480 },
  { time: '14:00', value: 520 },
  { time: '16:00', value: 470 },
  { time: '18:00', value: 380 },
  { time: '20:00', value: 280 },
  { time: '22:00', value: 180 }
];

export default function SalesChart() {
  return (
    <div className={styles.chartContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Daily Selling Activity</h2>
        <div className={styles.actions}>
          <div className={styles.totalValue}>
            <span className={styles.dot}></span>
            $2,420.22
          </div>
          <button className={styles.menuButton}>
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F5365C" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#F5365C" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#A0AEC0', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#A0AEC0', fontSize: 12 }} 
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#F5365C" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              activeDot={{ r: 6, fill: '#F5365C', stroke: '#FFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
