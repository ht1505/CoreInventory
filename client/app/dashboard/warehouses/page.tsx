'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Warehouse, MapPin, Plus, X, Pencil, Trash2 } from 'lucide-react';

interface Location { id: number; name: string; }
interface WarehouseType { id: number; name: string; address: string; locations: Location[]; }

export default function WarehousesPage() {
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<WarehouseType | null>(null);
  const [form, setForm] = useState({ name: '', address: '' });

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get('/warehouses');
      setWarehouses(res.data);
    } catch { toast.error('Failed to load warehouses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', address: '' }); setShowModal(true); };
  const openEdit = (w: WarehouseType) => { setEditing(w); setForm({ name: w.name, address: w.address }); setShowModal(true); };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await axios.put(`/warehouses/${editing.id}`, form);
        toast.success('Warehouse updated');
      } else {
        await axios.post('/warehouses', form);
        toast.success('Warehouse created');
      }
      setShowModal(false);
      fetchWarehouses();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this warehouse?')) return;
    try {
      await axios.delete(`/warehouses/${id}`);
      toast.success('Warehouse deleted');
      fetchWarehouses();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    // FIX: minHeight changed to '100vh' to prevent black background in empty space
    <div style={{ padding: '24px', background: '#f8f9fc', minHeight: '100vh', fontFamily: 'Inter, DM Sans, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>Warehouses</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>{warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''} configured</p>
        </div>
        {isManager && (
          <button onClick={openCreate} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, DM Sans, sans-serif',
          }}>
            <Plus size={14} /> New Warehouse
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading...</div>
      ) : warehouses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <Warehouse size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p>No warehouses yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {warehouses.map(w => (
            <div key={w.id} style={{
              background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
              padding: '20px', transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Warehouse size={16} color="#6366f1" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{w.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                      <MapPin size={10} />{w.address}
                    </div>
                  </div>
                </div>
                {isManager && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => openEdit(w)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#6b7280' }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => handleDelete(w.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Locations ({w.locations.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {w.locations.length === 0 ? (
                    <span style={{ fontSize: '12px', color: '#d1d5db' }}>No locations</span>
                  ) : w.locations.map(loc => (
                    <span key={loc.id} style={{ background: '#f3f4f6', color: '#374151', fontSize: '11px', padding: '3px 8px', borderRadius: '20px' }}>
                      {loc.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#111827', margin: 0 }}>
                {editing ? 'Edit Warehouse' : 'New Warehouse'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            {['name', 'address'].map(field => (
              <div key={field} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="text"
                  value={(form as any)[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#111827', boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, DM Sans, sans-serif' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#6366f1'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#6b7280', fontFamily: 'Inter, DM Sans, sans-serif' }}>Cancel</button>
              <button onClick={handleSubmit} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'Inter, DM Sans, sans-serif' }}>
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}