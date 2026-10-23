"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, PlusCircle } from "lucide-react";
import { L, statusStyle, Loader } from "@/lib/lightStyles";
import { useAuth } from "@/hooks/useAuth";

interface Location { id: string | number; name: string; }
interface StockItem { locationId: number; quantity: number; }
interface Product { id: string | number; name: string; sku?: string; stocks?: StockItem[]; }
interface DeliveryLine { id: number; productId: number; orderedQty: number; deliveredQty?: number; product?: { name: string; sku: string }; }
interface Delivery { id: string | number; reference: string; customerName: string; location: { id: number; name: string }; lines?: DeliveryLine[]; status: "DRAFT"|"WAITING"|"READY"|"DONE"|"CANCELED"; createdAt: string; }

const init = { customerName: "", locationId: "", lines: [{ productId: "", orderedQuantity: 1, deliveredQuantity: 0 }] };

export default function DeliveriesPage() {
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(init);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [d, l, p] = await Promise.all([axios.get("/deliveries"), axios.get("/locations"), axios.get("/products")]);
      setDeliveries(d.data); setLocations(l.data); setProducts(p.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getAvailableStock = (productId: string | number, locationId: string | number) => {
    if (!productId || !locationId) return null;
    const prod = products.find(p => String(p.id) === String(productId));
    if (!prod || !prod.stocks) return 0;
    const match = prod.stocks.find(s => String(s.locationId) === String(locationId));
    return match ? match.quantity : 0;
  };

  const updateLine = (i: number, field: string, value: any) => {
    const lines = [...form.lines]; lines[i] = { ...lines[i], [field]: value };
    setForm(p => ({ ...p, lines }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.locationId || form.lines.some(l => !l.productId)) return toast.error("Fill all fields.");
    try {
      await axios.post("/deliveries", form);
      toast.success("Delivery created!"); setOpen(false); setForm(init); fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create delivery.");
    }
  };

  const handleValidate = async (id: string | number) => {
    try {
      await axios.patch(`/deliveries/${id}/validate`);
      toast.success("Delivery validated!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to validate delivery.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ ...L.page, minHeight: '100vh' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .op-row:hover { background: #fafafa; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>Deliveries</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>{deliveries.length} deliver{deliveries.length !== 1 ? 'ies' : 'y'} total</p>
        </div>
        {isManager && <button style={L.btnPrimary} onClick={() => setOpen(true)}>+ New Delivery</button>}
      </div>

      <div style={L.tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Reference', 'Customer', 'Location', 'Items', 'Date', 'Status', ...(isManager ? ['Action'] : [])].map(h => (
                <th key={h} style={L.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0
              ? <tr><td colSpan={7} style={{ ...L.td, textAlign: 'center', padding: '40px' }}>No deliveries found</td></tr>
              : deliveries.map(d => (
                <tr key={d.id} className="op-row">
                  <td style={L.tdPrimary}>{d.reference}</td>
                  <td style={L.td}>{d.customerName}</td>
                  <td style={L.td}>{d.location?.name || '—'}</td>
                  <td style={L.td}>
                    {d.lines && d.lines.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {d.lines.map((l, idx) => (
                          <span key={idx} style={{ fontSize: '12px', color: '#374151' }}>
                            {l.product?.name || `Product #${l.productId}`} × <strong>{l.orderedQty}</strong>
                          </span>
                        ))}
                      </div>
                    ) : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td style={L.td}>{new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={L.td}><span style={statusStyle(d.status)}>{d.status}</span></td>
                  {isManager && (
                    <td style={L.td}>
                      {(d.status === 'DRAFT' || d.status === 'READY') && (
                        <button style={L.btnValidate} onClick={() => handleValidate(d.id)}>Validate</button>
                      )}
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
              <div>
                <div style={L.modalTitle}>New Delivery</div>
                <div style={L.modalSub}>Record outgoing stock to a customer</div>
              </div>
              <button style={L.btnGhost} onClick={() => setOpen(false)}><X size={16} color="#6b7280" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={L.label}>Customer Name</label>
                  <input style={L.input} required value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label style={L.label}>Source Location</label>
                  <select style={L.select} required value={form.locationId} onChange={e => setForm(p => ({ ...p, locationId: e.target.value }))}>
                    <option value="">Select location...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <label style={L.label}>Product Lines</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 32px', gap: '8px', marginBottom: '4px', padding: '0 10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ordered</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivered</span>
                <span></span>
              </div>
              {form.lines.map((line, i) => {
                const stockAvailable = getAvailableStock(line.productId, form.locationId);
                return (
                  <div key={i} style={{ marginBottom: '12px', padding: '10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 32px', gap: '8px', alignItems: 'center' }}>
                      <select style={L.select} required value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)}>
                        <option value="">Select product...</option>
                        {products.map(p => {
                          const s = form.locationId ? getAvailableStock(p.id, form.locationId) : null;
                          return (
                            <option key={p.id} value={p.id}>
                              {p.name} {s !== null ? `(${s} in stock)` : ''}
                            </option>
                          );
                        })}
                      </select>
                      <input style={L.input} type="number" min="1" placeholder="Ordered" value={line.orderedQuantity} onChange={e => updateLine(i, 'orderedQuantity', Number(e.target.value))} />
                      <input style={L.input} type="number" min="0" placeholder="Delivered" value={line.deliveredQuantity} onChange={e => updateLine(i, 'deliveredQuantity', Number(e.target.value))} />
                      <button type="button" style={L.btnGhost} onClick={() => setForm(p => ({ ...p, lines: p.lines.filter((_, idx) => idx !== i) }))}>
                        <X size={14} color="#6b7280" />
                      </button>
                    </div>
                    {form.locationId && line.productId && (
                      <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: 500, color: (stockAvailable ?? 0) >= line.orderedQuantity ? '#16a34a' : '#dc2626' }}>
                        {(stockAvailable ?? 0) >= line.orderedQuantity
                          ? `✓ Available stock at location: ${stockAvailable} units`
                          : `⚠ Available stock: ${stockAvailable ?? 0} units (Requested: ${line.orderedQuantity})`}
                      </div>
                    )}
                  </div>
                );
              })}
              <button type="button" style={{ ...L.btnOutline, marginBottom: '20px', marginTop: '4px' }}
                onClick={() => setForm(p => ({ ...p, lines: [...p.lines, { productId: "", orderedQuantity: 1, deliveredQuantity: 0 }] }))}>
                <PlusCircle size={13} /> Add Line
              </button>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" style={L.btnSecondary} onClick={() => setOpen(false)}>Cancel</button>
                <button type="submit" style={L.btnPrimary}>Save Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}