"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Package, AlertTriangle, XCircle, ClipboardList, Truck, ArrowRight } from "lucide-react";

interface KpiData {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  pendingReceipts: number;
  pendingDeliveries: number;
}

interface Movement {
  id: string;
  product: { name: string };
  location: { name: string };
  movementType: string;
  quantityChange: number;
  createdAt: string;
}

const kpiConfig = [
  { key: 'totalProducts',    label: 'Total Products',      icon: Package,       color: '#6366f1', bg: '#eef2ff',  href: '/dashboard/products',   sub: 'View all' },
  { key: 'lowStock',         label: 'Low Stock',           icon: AlertTriangle, color: '#d97706', bg: '#fffbeb',  href: '/dashboard/products',   sub: 'Needs attention' },
  { key: 'outOfStock',       label: 'Out of Stock',        icon: XCircle,       color: '#dc2626', bg: '#fef2f2',  href: '/dashboard/products',   sub: 'Reorder now' },
  { key: 'pendingReceipts',  label: 'Pending Receipts',    icon: ClipboardList, color: '#16a34a', bg: '#f0fdf4',  href: '/dashboard/receipts',   sub: 'Incoming stock' },
  { key: 'pendingDeliveries',label: 'Pending Deliveries',  icon: Truck,         color: '#7c3aed', bg: '#f5f3ff',  href: '/dashboard/deliveries', sub: 'Outgoing orders' },
];

const typeColors: Record<string, { bg: string; color: string }> = {
  RECEIPT:      { bg: '#f0fdf4', color: '#16a34a' },
  DELIVERY:     { bg: '#fef2f2', color: '#dc2626' },
  TRANSFER:     { bg: '#eff6ff', color: '#2563eb' },
  ADJUSTMENT:   { bg: '#fffbeb', color: '#d97706' },
  receipt:      { bg: '#f0fdf4', color: '#16a34a' },
  delivery:     { bg: '#fef2f2', color: '#dc2626' },
  transfer_in:  { bg: '#eff6ff', color: '#2563eb' },
  transfer_out: { bg: '#eff6ff', color: '#2563eb' },
  adjustment:   { bg: '#fffbeb', color: '#d97706' },
};

export default function DashboardPage() {
  const user = useAuth();
  const router = useRouter();
  const [kpis, setKpis] = useState<KpiData>({ totalProducts: 0, lowStock: 0, outOfStock: 0, pendingReceipts: 0, pendingDeliveries: 0 });
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/dashboard').then(res => {
      setKpis({
        totalProducts:     res.data.totalProducts    ?? 0,
        lowStock:          res.data.lowStockCount    ?? 0,
        outOfStock:        res.data.outOfStockCount  ?? 0,
        pendingReceipts:   res.data.pendingReceipts  ?? 0,
        pendingDeliveries: res.data.pendingDeliveries ?? 0,
      });
      setMovements(res.data.recentMovements ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px', background: '#f8f9fc', minHeight: '100%', fontFamily: 'DM Sans, sans-serif', overflowY: 'auto' }}>
      <style suppressHydrationWarning>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); .kpi-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);transform:translateY(-1px)} .mv-row:hover{background:#fafafa}`}</style>

      {/* Welcome */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px', color: '#111827', margin: 0 }}>
          Good day, {user?.name?.split(' ')[0] || 'there'} 👋
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }}>Here's what's happening with your inventory today.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {kpiConfig.map(({ key, label, icon: Icon, color, bg, href, sub }) => (
          <div key={key} className="kpi-card" onClick={() => router.push(href)} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '16px', cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Icon size={15} color={color} />
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '26px', color, lineHeight: 1 }}>
              {loading ? '—' : (kpis as any)[key]}
            </div>
            <div style={{ fontSize: '12px', color: '#111827', fontWeight: 600, marginTop: '4px' }}>{label}</div>
            <div style={{ fontSize: '11px', color, marginTop: '6px', paddingTop: '6px', borderTop: `1px solid ${bg}`, display: 'flex', alignItems: 'center', gap: '3px' }}>
              {sub} <ArrowRight size={10} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Movements */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: '#111827' }}>Recent Movements</span>
        <span onClick={() => router.push('/dashboard/ledger')} style={{ color: '#6366f1', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>View all →</span>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Product', 'Location', 'Type', 'Quantity', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No recent movements</td></tr>
            ) : movements.map((m, i) => {
              const tc = typeColors[m.movementType] || { bg: '#f3f4f6', color: '#6b7280' };
              return (
                <tr key={m.id} className="mv-row" style={{ borderBottom: i < movements.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.1s' }}>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: '#111827', fontWeight: 500 }}>{m.product.name}</td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: '#6b7280' }}>{m.location.name}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: tc.bg, color: tc.color }}>{m.movementType}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: 700, color: m.quantityChange > 0 ? '#16a34a' : '#dc2626' }}>
                    {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '12px', color: '#9ca3af' }}>
                    {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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