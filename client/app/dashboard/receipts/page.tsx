"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, PlusCircle } from "lucide-react";
import { L, statusStyle, Loader } from "@/lib/lightStyles";
import { useAuth } from "@/hooks/useAuth";

interface Supplier { id: string; name: string; }
interface Location { id: string; name: string; }
interface Product { id: string; name: string; }
interface Receipt { id: string; reference: string; supplier: { name: string }; location: { name: string }; status: "DRAFT"|"WAITING"|"READY"|"DONE"|"CANCELED"; createdAt: string; }

const init = { supplierId: "", locationId: "", lines: [{ productId: "", expectedQuantity: 1, receivedQuantity: 0 }] };

export default function ReceiptsPage() {
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(init);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [r, s, l, p] = await Promise.all([axios.get("/receipts"), axios.get("/suppliers"), axios.get("/locations"), axios.get("/products")]);
      setReceipts(r.data); setSuppliers(s.data); setLocations(l.data); setProducts(p.data);
    } catch { toast.error("Failed to fetch data."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const updateLine = (i: number, field: string, value: any) => {
    const lines = [...form.lines];
    lines[i] = { ...lines[i], [field]: value };
    setForm(p => ({ ...p, lines }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierId || !form.locationId || form.lines.some(l => !l.productId)) return toast.error("Fill all fields.");
    try {
      await axios.post("/receipts", form);
      toast.success("Receipt created!"); setOpen(false); setForm(init); fetchData();
    } catch { toast.error("Failed to create receipt."); }
  };

  const handleValidate = async (id: string) => {
    try { await axios.patch(`/receipts/${id}/validate`); toast.success("Receipt validated!"); fetchData(); }
    catch { toast.error("Failed to validate."); }
  };

  if (loading) return <Loader />;

  return (
    <div style={L.page}>
      <style suppressHydrationWarning>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); .op-row:hover{background:#fafafa}`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>Receipts</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>{receipts.length} receipt{receipts.length !== 1 ? 's' : ''} total</p>
        </div>
        {isManager && <button style={L.btnPrimary} onClick={() => setOpen(true)}>+ New Receipt</button>}
      </div>

      <div style={L.tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Reference', 'Supplier', 'Location', 'Date', 'Status', ...(isManager ? ['Action'] : [])].map(h => <th key={h} style={L.th}>{h}</th>)}</tr></thead>
          <tbody>
            {receipts.length === 0
              ? <tr><td colSpan={6} style={{ ...L.td, textAlign: 'center', padding: '40px' }}>No receipts found</td></tr>
              : receipts.map(r => (
                <tr key={r.id} className="op-row">
                  <td style={L.tdPrimary}>{r.reference}</td>
                  <td style={L.td}>{r.supplier.name}</td>
                  <td style={L.td}>{r.location.name}</td>
                  <td style={L.td}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={L.td}><span style={statusStyle(r.status)}>{r.status}</span></td>
                  {isManager && (
                    <td style={L.td}>
                      {(r.status === 'DRAFT' || r.status === 'READY') &&
                        <button style={L.btnValidate} onClick={() => handleValidate(r.id)}>Validate</button>}
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
              <div><div style={L.modalTitle}>New Receipt</div><div style={L.modalSub}>Record incoming stock from a supplier</div></div>
              <button style={L.btnGhost} onClick={() => setOpen(false)}><X size={16} color="#6b7280" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={L.label}>Supplier</label>
                  <select style={L.select} required value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}>
                    <option value="">Select supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={L.label}>Destination Location</label>
                  <select style={L.select} required value={form.locationId} onChange={e => setForm(p => ({ ...p, locationId: e.target.value }))}>
                    <option value="">Select location...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <label style={L.label}>Product Lines</label>
              {form.lines.map((line, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <select style={L.select} required value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)}>
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input style={L.input} type="number" placeholder="Expected" value={line.expectedQuantity} onChange={e => updateLine(i, 'expectedQuantity', Number(e.target.value))} />
                  <input style={L.input} type="number" placeholder="Received" value={line.receivedQuantity} onChange={e => updateLine(i, 'receivedQuantity', Number(e.target.value))} />
                  <button type="button" style={L.btnGhost} onClick={() => setForm(p => ({ ...p, lines: p.lines.filter((_, idx) => idx !== i) }))}><X size={14} color="#6b7280" /></button>
                </div>
              ))}
              <button type="button" style={{ ...L.btnOutline, marginBottom: '20px', marginTop: '4px' }}
                onClick={() => setForm(p => ({ ...p, lines: [...p.lines, { productId: "", expectedQuantity: 1, receivedQuantity: 0 }] }))}>
                <PlusCircle size={13} /> Add Line
              </button>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" style={L.btnSecondary} onClick={() => setOpen(false)}>Cancel</button>
                <button type="submit" style={L.btnPrimary}>Save Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}