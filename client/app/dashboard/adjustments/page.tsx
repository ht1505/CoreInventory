"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, PlusCircle } from "lucide-react";
import { L, statusStyle, Loader } from "@/lib/lightStyles";
import { useAuth } from "@/hooks/useAuth";

interface Location { id: string; name: string; }
interface Product { id: string; name: string; }
interface Adjustment { id: string; reference: string; location: { name: string }; reason: string; status: "DRAFT"|"WAITING"|"READY"|"DONE"|"CANCELED"; createdAt: string; }

const init = { locationId: "", reason: "", lines: [{ productId: "", recordedQty: 0, actualQty: 0 }] };

export default function AdjustmentsPage() {
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(init);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [a, l, p] = await Promise.all([axios.get("/adjustments"), axios.get("/locations"), axios.get("/products")]);
      setAdjustments(a.data); setLocations(l.data); setProducts(p.data);
    } catch { toast.error("Failed to fetch data."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const updateLine = (i: number, field: string, value: any) => {
    const lines = [...form.lines]; lines[i] = { ...lines[i], [field]: value };
    setForm(p => ({ ...p, lines }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.locationId || !form.reason || form.lines.some(l => !l.productId)) return toast.error("Fill all fields.");
    try {
      await axios.post("/adjustments", form);
      toast.success("Adjustment created!"); setOpen(false); setForm(init); fetchData();
    } catch { toast.error("Failed to create adjustment."); }
  };

  const handleValidate = async (id: string) => {
    try { await axios.patch(`/adjustments/${id}/validate`); toast.success("Adjustment validated!"); fetchData(); }
    catch { toast.error("Failed to validate."); }
  };

  if (loading) return <Loader />;

  return (
    <div style={L.page}>
      <style suppressHydrationWarning>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); .op-row:hover{background:#fafafa}`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>Stock Adjustments</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>{adjustments.length} adjustment{adjustments.length !== 1 ? 's' : ''} total</p>
        </div>
        {isManager && <button style={L.btnPrimary} onClick={() => setOpen(true)}>+ New Adjustment</button>}
      </div>

      <div style={L.tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Reference', 'Location', 'Reason', 'Date', 'Status', ...(isManager ? ['Action'] : [])].map(h => <th key={h} style={L.th}>{h}</th>)}</tr></thead>
          <tbody>
            {adjustments.length === 0
              ? <tr><td colSpan={6} style={{ ...L.td, textAlign: 'center', padding: '40px' }}>No adjustments found</td></tr>
              : adjustments.map(a => (
                <tr key={a.id} className="op-row">
                  <td style={L.tdPrimary}>{a.reference}</td>
                  <td style={L.td}>{a.location.name}</td>
                  <td style={L.td}><span style={{ background: '#fffbeb', color: '#d97706', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{a.reason}</span></td>
                  <td style={L.td}>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={L.td}><span style={statusStyle(a.status)}>{a.status}</span></td>
                  {isManager && (
                    <td style={L.td}>
                      {a.status === 'DRAFT' &&
                        <button style={L.btnValidate} onClick={() => handleValidate(a.id)}>Validate</button>}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div style={L.modalOverlay} onClick={() => setOpen(false)}>
          <div style={L.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div><div style={L.modalTitle}>New Adjustment</div><div style={L.modalSub}>Correct stock discrepancies</div></div>
              <button style={L.btnGhost} onClick={() => setOpen(false)}><X size={16} color="#6b7280" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={L.label}>Location</label>
                  <select style={L.select} required value={form.locationId} onChange={e => setForm(p => ({ ...p, locationId: e.target.value }))}>
                    <option value="">Select location...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={L.label}>Reason</label>
                  <input style={L.input} required value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. Damaged goods" />
                </div>
              </div>
              <label style={L.label}>Product Lines</label>
              {form.lines.map((line, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <select style={L.select} required value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)}>
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input style={L.input} type="number" placeholder="Recorded" value={line.recordedQty} onChange={e => updateLine(i, 'recordedQty', Number(e.target.value))} />
                  <input style={L.input} type="number" placeholder="Actual" value={line.actualQty} onChange={e => updateLine(i, 'actualQty', Number(e.target.value))} />
                  <button type="button" style={L.btnGhost} onClick={() => setForm(p => ({ ...p, lines: p.lines.filter((_, idx) => idx !== i) }))}><X size={14} color="#6b7280" /></button>
                </div>
              ))}
              <button type="button" style={{ ...L.btnOutline, marginBottom: '20px', marginTop: '4px' }}
                onClick={() => setForm(p => ({ ...p, lines: [...p.lines, { productId: "", recordedQty: 0, actualQty: 0 }] }))}>
                <PlusCircle size={13} /> Add Line
              </button>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" style={L.btnSecondary} onClick={() => setOpen(false)}>Cancel</button>
                <button type="submit" style={L.btnPrimary}>Save Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}