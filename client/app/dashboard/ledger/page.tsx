'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, SlidersHorizontal } from 'lucide-react';

interface LedgerEntry {
  id: number;
  movementType: string;
  reference: string;
  quantityChange: number;
  quantityAfter: number;
  createdAt: string;
  product: { name: string; sku: string; };
  location: { name: string; };
  createdBy: { name: string; };
}

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  RECEIPT:    { label: 'Receipt',    color: '#16a34a', bg: '#f0fdf4', icon: ArrowDownCircle },
  DELIVERY:   { label: 'Delivery',   color: '#dc2626', bg: '#fef2f2', icon: ArrowUpCircle },
  TRANSFER:   { label: 'Transfer',   color: '#2563eb', bg: '#eff6ff', icon: ArrowLeftRight },
  ADJUSTMENT: { label: 'Adjustment', color: '#d97706', bg: '#fffbeb', icon: SlidersHorizontal },
};

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    axios.get('/ledger')
      .then(res => setEntries(res.data))
      .catch(() => toast.error('Failed to load ledger'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? entries : entries.filter(e => e.movementType === filter);

  return (
    // FIX: minHeight changed to '100vh' to prevent black background in empty space
    <div style={{ padding: '24px', background: '#f8f9fc', minHeight: '100vh', fontFamily: 'Inter, DM Sans, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>Move History</h2>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>Complete stock movement audit trail</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'].map(type => (
          <button key={type} onClick={() => setFilter(type)} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
            border: '1px solid',
            borderColor: filter === type ? '#6366f1' : '#e5e7eb',
            background: filter === type ? '#eef2ff' : '#fff',
            color: filter === type ? '#4f46e5' : '#6b7280',
            cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'Inter, DM Sans, sans-serif',
          }}>
            {type === 'ALL' ? 'All Movements' : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Type', 'Reference', 'Product', 'Location', 'Change', 'Stock After', 'By', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, DM Sans, sans-serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No entries found</td></tr>
            ) : filtered.map((entry, i) => {
              const cfg = typeConfig[entry.movementType] || { label: entry.movementType, color: '#6b7280', bg: '#f3f4f6', icon: ArrowLeftRight };
              const Icon = cfg.icon;
              const isPositive = entry.quantityChange > 0;
              return (
                <tr key={entry.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px', background: cfg.bg, color: cfg.color, fontSize: '11px', fontWeight: 600 }}>
                      <Icon size={11} />{cfg.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#4f46e5', fontWeight: 500 }}>{entry.reference}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{entry.product.name}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{entry.product.sku}</div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>{entry.location.name}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: isPositive ? '#16a34a' : '#dc2626' }}>
                      {isPositive ? '+' : ''}{entry.quantityChange}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{entry.quantityAfter}</td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>{entry.createdBy.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', color: '#9ca3af' }}>
                    {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}