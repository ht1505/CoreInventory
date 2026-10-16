"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, PlusCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Location { id: string; name: string; }
interface Product { id: string; name: string; }
interface Transfer { id: string; reference: string; fromLocation: { name: string }; toLocation: { name: string }; status: "DRAFT"|"WAITING"|"READY"|"DONE"|"CANCELED"; createdAt: string; }

const init = { fromLocationId: "", toLocationId: "", lines: [{ productId: "", quantity: 1 }] };

const statusStyle = (s: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    DRAFT:     { background: '#f3f4f6', color: '#6b7280' },
    WAITING:   { background: '#fffbeb', color: '#d97706' },
    READY:     { background: '#eff6ff', color: '#2563eb' },
    DONE:      { background: '#f0fdf4', color: '#16a34a' },
    CANCELED:  { background: '#fef2f2', color: '#dc2626' },
  };
  return { ...( map[s] || map.DRAFT), padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
};

const th: React.CSSProperties = { padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' };
const td: React.CSSProperties = { padding: '13px 16px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6' };
const tdPrimary: React.CSSProperties = { ...td, fontWeight: 600, color: '#111827' };
const input: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#111827', background: '#fff', boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, DM Sans, sans-serif' };
const select: React.CSSProperties = { ...input };
const label: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' };
const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, DM Sans, sans-serif' };
const btnSecondary: React.CSSProperties = { background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' };
const btnValidate: React.CSSProperties = { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' };
const btnOutline: React.CSSProperties = { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };

export default function TransfersPage() {
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(init);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [t, l, p] = await Promise.all([axios.get("/transfers"), axios.get("/locations"), axios.get("/products")]);
      setTransfers(t.data); setLocations(l.data); setProducts(p.data);
    } catch { toast.error("Failed to fetch data."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const updateLine = (i: number, field: string, value: any) => {
    const lines = [...form.lines]; lines[i] = { ...lines[i], [field]: value };
    setForm(p => ({ ...p, lines }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromLocationId || !form.toLocationId || form.lines.some(l => !l.productId)) return toast.error("Fill all fields.");
    if (form.fromLocationId === form.toLocationId) return toast.error("From and To locations cannot be the same.");
    try {
      await axios.post("/transfers", form);
      toast.success("Transfer created!"); setOpen(false); setForm(init); fetchData();
    } catch { toast.error("Failed to create transfer."); }
  };

  const handleValidate = async (id: string) => {
    try { await axios.patch(`/transfers/${id}/validate`); toast.success("Transfer validated!"); fetchData(); }
    catch { toast.error("Failed to validate."); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: 'Inter, DM Sans, sans-serif' }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ padding: '24px', background: '#f8f9fc', minHeight: '100vh', fontFamily: 'Inter, DM Sans, sans-serif' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .op-row:hover { background: #fafafa; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>Internal Transfers</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>{transfers.length} transfer{transfers.length !== 1 ? 's' : ''} total</p>
        </div>
        {isManager && <button style={btnPrimary} onClick={() => setOpen(true)}>+ New Transfer</button>}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Reference', 'Route', 'Date', 'Status', ...(isManager ? ['Action'] : [])].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0
              ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center', padding: '40px' }}>No transfers found</td></tr>
              : transfers.map(t => (
                <tr key={t.id} className="op-row">
                  <td style={tdPrimary}>{t.reference}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: '#374151' }}>{t.fromLocation.name}</span>
                      <ArrowRight size={12} color="#9ca3af" />
                      <span style={{ background: '#eef2ff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: '#4f46e5' }}>{t.toLocation.name}</span>
                    </div>
                  </td>
                  <td style={td}>{new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={td}><span style={statusStyle(t.status)}>{t.status}</span></td>
                  {isManager && (
                    <td style={td}>
                      {t.status === 'DRAFT' &&
                        <button style={btnValidate} onClick={() => handleValidate(t.id)}>Validate</button>}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '520px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#111827' }}>New Transfer</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Move stock between locations</div>
              </div>
              <button style={btnGhost} onClick={() => setOpen(false)}><X size={16} color="#6b7280" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={label}>From Location</label>
                  <select style={select} required value={form.fromLocationId} onChange={e => setForm(p => ({ ...p, fromLocationId: e.target.value }))}>
                    <option value="">Select source...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>To Location</label>
                  <select style={select} required value={form.toLocationId} onChange={e => setForm(p => ({ ...p, toLocationId: e.target.value }))}>
                    <option value="">Select destination...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <label style={label}>Product Lines</label>
              {form.lines.map((line, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <select style={select} required value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)}>
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input style={input} type="number" placeholder="Quantity" value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} />
                  <button type="button" style={btnGhost} onClick={() => setForm(p => ({ ...p, lines: p.lines.filter((_, idx) => idx !== i) }))}>
                    <X size={14} color="#6b7280" />
                  </button>
                </div>
              ))}
              <button type="button" style={{ ...btnOutline, marginBottom: '20px', marginTop: '4px' }}
                onClick={() => setForm(p => ({ ...p, lines: [...p.lines, { productId: "", quantity: 1 }] }))}>
                <PlusCircle size={13} /> Add Line
              </button>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" style={btnSecondary} onClick={() => setOpen(false)}>Cancel</button>
                <button type="submit" style={btnPrimary}>Save Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}