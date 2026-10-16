'use client';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Database, RefreshCw } from 'lucide-react';

const TABLES = [
  { key: 'products',    label: 'Products',    endpoint: '/products',    cols: ['id','name','sku','category.name','unit','reorderLevel'] },
  { key: 'users',       label: 'Users',       endpoint: '/users',       cols: ['id','name','email','role','createdAt'] },
  { key: 'suppliers',   label: 'Suppliers',   endpoint: '/suppliers',   cols: ['id','name','contact'] },
  { key: 'warehouses',  label: 'Warehouses',  endpoint: '/warehouses',  cols: ['id','name','address'] },
  { key: 'locations',   label: 'Locations',   endpoint: '/locations',   cols: ['id','name','warehouse.name'] },
  { key: 'receipts',    label: 'Receipts',    endpoint: '/receipts',    cols: ['id','reference','supplier.name','location.name','status','createdAt'] },
  { key: 'deliveries',  label: 'Deliveries',  endpoint: '/deliveries',  cols: ['id','reference','customerName','location.name','status','createdAt'] },
  { key: 'transfers',   label: 'Transfers',   endpoint: '/transfers',   cols: ['id','reference','fromLocation.name','toLocation.name','status','createdAt'] },
  { key: 'adjustments', label: 'Adjustments', endpoint: '/adjustments', cols: ['id','reference','location.name','reason','status','createdAt'] },
  { key: 'ledger',      label: 'Stock Ledger', endpoint: '/ledger',     cols: ['id','movementType','reference','product.name','location.name','quantityChange','quantityAfter','createdAt'] },
];

function getNestedValue(obj: any, path: string): string {
  const val = path.split('.').reduce((o, k) => o?.[k], obj);
  if (val === null || val === undefined) return '—';
  if (typeof val === 'string' && val.includes('T') && val.includes('Z')) {
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return String(val);
}

function colLabel(col: string): string {
  return col.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()) || col;
}

export default function DatabasePage() {
  const user = useAuth();
  const router = useRouter();
  const [activeTable, setActiveTable] = useState(TABLES[0]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'MANAGER') {
      toast.error('Access denied. Managers only.');
      router.push('/dashboard');
    }
  }, [user]);

  const fetchTable = async (table: typeof TABLES[0]) => {
    setLoading(true);
    setData([]);
    try {
      const res = await axios.get(table.endpoint);
      setData(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch { toast.error(`Failed to load ${table.label}`); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTable(activeTable); }, [activeTable]);

  if (user?.role !== 'MANAGER') return null;

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f8f9fc', fontFamily: 'DM Sans, sans-serif' }}>
      <style suppressHydrationWarning>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); .db-row:hover{background:#fafafa} .db-tab:hover{background:#f3f4f6}`}</style>

      {/* Left sidebar - table list */}
      <div style={{ width: '200px', background: '#fff', borderRight: '1px solid #e5e7eb', padding: '16px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 16px 12px', borderBottom: '1px solid #f3f4f6', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Database size={14} color="#6366f1" />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#111827' }}>Database</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Manager View</div>
        </div>
        {TABLES.map(t => (
          <button key={t.key} className="db-tab" onClick={() => setActiveTable(t)} style={{
            width: '100%', textAlign: 'left', padding: '8px 16px',
            background: activeTable.key === t.key ? '#eef2ff' : 'transparent',
            color: activeTable.key === t.key ? '#4f46e5' : '#374151',
            border: 'none', cursor: 'pointer', fontSize: '13px',
            fontWeight: activeTable.key === t.key ? 600 : 400,
            borderLeft: activeTable.key === t.key ? '3px solid #6366f1' : '3px solid transparent',
            transition: 'all 0.1s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: '#111827', margin: 0 }}>{activeTable.label}</h2>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>{data.length} record{data.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => fetchTable(activeTable)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '8px', padding: '7px 14px',
            fontSize: '12px', color: '#6b7280', cursor: 'pointer',
          }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {activeTable.cols.map(col => (
                  <th key={col} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                    {colLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={activeTable.cols.length} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={activeTable.cols.length} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No records found</td></tr>
              ) : data.map((row, i) => (
                <tr key={i} className="db-row" style={{ borderBottom: i < data.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  {activeTable.cols.map(col => (
                    <td key={col} style={{ padding: '10px 14px', fontSize: '12px', color: col === activeTable.cols[0] ? '#111827' : '#6b7280', fontWeight: col === activeTable.cols[0] ? 600 : 400, whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {col === 'role' ? (
                        <span style={{ background: row.role === 'MANAGER' ? '#eef2ff' : '#f0fdf4', color: row.role === 'MANAGER' ? '#4f46e5' : '#16a34a', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                          {row.role}
                        </span>
                      ) : col === 'status' ? (
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          background: row.status === 'DONE' ? '#f0fdf4' : row.status === 'DRAFT' ? '#f3f4f6' : row.status === 'CANCELED' ? '#fef2f2' : '#fffbeb',
                          color: row.status === 'DONE' ? '#16a34a' : row.status === 'DRAFT' ? '#6b7280' : row.status === 'CANCELED' ? '#dc2626' : '#d97706',
                        }}>{row.status}</span>
                      ) : getNestedValue(row, col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}