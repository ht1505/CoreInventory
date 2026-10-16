"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import { useRouter } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard/products':    'Products',
  '/dashboard/receipts':    'Receipts',
  '/dashboard/deliveries':  'Deliveries',
  '/dashboard/transfers':   'Internal Transfers',
  '/dashboard/adjustments': 'Stock Adjustments',
  '/dashboard/ledger':      'Move History',
  '/dashboard/warehouses':  'Warehouses',
  '/dashboard/suppliers':   'Suppliers',
  '/dashboard/database':    'Database Explorer',
  '/dashboard':             'Dashboard',
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';

  const title = Object.entries(pageTitles).find(([k]) => k === pathname || (k !== '/dashboard' && pathname.startsWith(k)))?.[1] || 'Dashboard';

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: '#111827', margin: 0 }}>
          {title}
        </h1>
        {/* Role badge */}
        <span style={{
          padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
          background: isManager ? '#eef2ff' : '#f0fdf4',
          color: isManager ? '#4f46e5' : '#16a34a',
          border: `1px solid ${isManager ? '#c7d2fe' : '#bbf7d0'}`,
          textTransform: 'uppercase', letterSpacing: '0.3px',
        }}>
          {user?.role === 'MANAGER' ? 'Manager' : 'Staff'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Low stock alert */}
        <button
          onClick={() => router.push('/dashboard/products')}
          style={{
            background: '#fef2f2', color: '#ef4444',
            border: '1px solid #fecaca',
            borderRadius: '20px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ⚠ Low Stock Alert
        </button>

      </div>
    </header>
  );
}