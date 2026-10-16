'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Users, Plus, X, Pencil, Trash2, Phone } from 'lucide-react';

interface Supplier { id: number; name: string; contact: string; _count?: { receipts: number }; }

export default function SuppliersPage() {
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', contact: '' });
  const [search, setSearch] = useState('');

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('/suppliers');
      setSuppliers(res.data);
    } catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', contact: '' }); setShowModal(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm({ name: s.name, contact: s.contact }); setShowModal(true); };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await axios.put(`/suppliers/${editing.id}`, form);
        toast.success('Supplier updated');
      } else {
        await axios.post('/suppliers', form);
        toast.success('Supplier created');
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await axios.delete(`/suppliers/${id}`);
      toast.success('Supplier deleted');
      fetchSuppliers();
    } catch { toast.error('Cannot delete supplier with existing receipts'); }
  };

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '24px', background: '#f8f9fc', minHeight: '100%', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>Suppliers</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} registered</p>
        </div>
        {isManager && (
          <button onClick={openCreate} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={14} /> New Supplier
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search suppliers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '280px', padding: '9px 14px', border: '1px solid #e5e7eb',
          borderRadius: '8px', fontSize: '13px', color: '#111827',
          background: '#fff', marginBottom: '20px', outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#6366f1'}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
      />

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Supplier', 'Contact', 'Receipts', ...(isManager ? ['Actions'] : [])].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No suppliers found</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={14} color="#6366f1" />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6b7280', fontSize: '13px' }}>
                    <Phone size={11} />{s.contact}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '12px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                    {s._count?.receipts ?? '—'} receipts
                  </span>
                </td>
                {isManager && (
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(s)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#111827', margin: 0 }}>
                {editing ? 'Edit Supplier' : 'New Supplier'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            {[{ key: 'name', label: 'Supplier Name' }, { key: 'contact', label: 'Contact (phone/email)' }].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</label>
                <input
                  type="text"
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#111827', boxSizing: 'border-box', outline: 'none' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#6366f1'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
              <button onClick={handleSubmit} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#fff' }}>
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}