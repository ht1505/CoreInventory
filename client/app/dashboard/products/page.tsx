"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, Package, Plus, ChevronDown, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string | number;
  name: string;
  sku: string;
  category: { id: number; name: string };
  unit: string;
  reorderLevel: number;
  stocks?: { quantity: number; location: { name: string } }[];
}

interface Category {
  id: number;
  name: string;
}

const init = { name: "", sku: "", categoryId: "", unit: "units", reorderLevel: 10 };

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#111827',
  background: '#fff',
  boxSizing: 'border-box' as const,
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600 as const,
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '5px',
};

export default function ProductsPage() {
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(init);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([
        axios.get("/products"),
        axios.get("/categories"),
      ]);
      setProducts(p.data);
      setCategories(c.data);
    } catch {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/products", {
        ...form,
        categoryId: parseInt(form.categoryId, 10),
        reorderLevel: Number(form.reorderLevel),
      });
      toast.success("Product created!");
      setOpen(false);
      setForm(init);
      fetchData();
    } catch {
      toast.error("Failed to create product.");
    }
  };

  const toggleCategory = (cat: string) => setCollapsed(p => ({ ...p, [cat]: !p[cat] }));

  const totalStock = (p: Product) => p.stocks?.reduce((sum, s) => sum + s.quantity, 0) ?? 0;
  const isLowStock = (p: Product) => {
    const s = totalStock(p);
    return s > 0 && s <= p.reorderLevel;
  };
  const isOutOfStock = (p: Product) => totalStock(p) === 0;

  // Filter products
  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || p.category?.name === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = isLowStock(p);
    else if (stockFilter === 'out') matchesStock = isOutOfStock(p);
    else if (stockFilter === 'in') matchesStock = totalStock(p) > p.reorderLevel;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, stockFilter, pageSize]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  // Group by category (from filtered)
  const grouped = filtered.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.category?.name || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '13px' }}>
        Loading inventory products...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f8f9fc', minHeight: '100%', fontFamily: 'DM Sans, sans-serif' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .ci-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
        .product-row:hover { background: #f9fafb; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>Products</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>
            {filtered.length} of {products.length} products listed across {categories.length} categories
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            {(['table', 'grouped'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '7px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: viewMode === mode ? '#eef2ff' : 'transparent',
                  color: viewMode === mode ? '#4f46e5' : '#6b7280',
                  transition: 'all 0.15s',
                }}
              >
                {mode === 'table' ? 'Table View' : 'Category Groups'}
              </button>
            ))}
          </div>

          {isManager && (
            <button
              onClick={() => setOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> New Product
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ci-input"
            style={{ ...inputStyle, paddingLeft: '32px' }}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="ci-input"
          style={{ ...inputStyle, width: '180px' }}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value as any)}
          className="ci-input"
          style={{ ...inputStyle, width: '150px' }}
        >
          <option value="all">All Stock Levels</option>
          <option value="in">In Stock (Healthy)</option>
          <option value="low">Low Stock Alert</option>
          <option value="out">Out of Stock</option>
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '12px', outline: 'none' }}
          >
            {[25, 50, 100].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Product Name', 'SKU', 'Category', 'Unit', 'Reorder Level', 'Total Stock', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No products match your search/filter criteria</td>
                </tr>
              ) : (
                paginated.map((p, i) => {
                  const qty = totalStock(p);
                  const isOut = qty === 0;
                  const isLow = isLowStock(p);
                  return (
                    <tr key={p.id} className="product-row" style={{ borderBottom: i < paginated.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.1s' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px', color: '#111827' }}>{p.name}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#6366f1', fontSize: '12px' }}>{p.sku}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.category?.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.unit}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.reorderLevel}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{qty}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {isOut ? (
                          <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>Out of Stock</span>
                        ) : isLow ? (
                          <span style={{ background: '#fffbeb', color: '#d97706', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>Low Stock</span>
                        ) : (
                          <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>In Stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {filtered.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafafa', borderTop: '1px solid #f3f4f6', fontSize: '12px', color: '#6b7280' }}>
              <div>
                Showing <strong style={{ color: '#111827' }}>{startIndex + 1}</strong> to <strong style={{ color: '#111827' }}>{Math.min(startIndex + pageSize, filtered.length)}</strong> of <strong style={{ color: '#111827' }}>{filtered.length}</strong> products
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    background: currentPage === 1 ? '#f3f4f6' : '#fff',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span style={{ padding: '0 8px', fontWeight: 600, color: '#111827' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    background: currentPage === totalPages ? '#f3f4f6' : '#fff',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Grouped View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div
                onClick={() => toggleCategory(category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  background: '#fafafa',
                  borderBottom: collapsed[category] ? 'none' : '1px solid #f3f4f6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={13} color="#6366f1" />
                  </div>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: '#111827' }}>{category}</span>
                  <span style={{ background: '#e0e7ff', color: '#4f46e5', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                    {items.length} items
                  </span>
                </div>
                {collapsed[category] ? <ChevronRight size={14} color="#9ca3af" /> : <ChevronDown size={14} color="#9ca3af" />}
              </div>

              {!collapsed[category] && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Product Name', 'SKU', 'Unit', 'Reorder Level', 'Total Stock', 'Status'].map(h => (
                        <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 50).map(p => {
                      const qty = totalStock(p);
                      const isOut = qty === 0;
                      const isLow = isLowStock(p);
                      return (
                        <tr key={p.id} className="product-row" style={{ borderTop: '1px solid #f3f4f6', transition: 'background 0.1s' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px', color: '#111827' }}>{p.name}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#6366f1', fontSize: '12px' }}>{p.sku}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.unit}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.reorderLevel}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{qty}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {isOut ? (
                              <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>Out of Stock</span>
                            ) : isLow ? (
                              <span style={{ background: '#fffbeb', color: '#d97706', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>Low Stock</span>
                            ) : (
                              <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>In Stock</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {items.length > 50 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', color: '#6366f1', background: '#f9fafb' }}>
                          Showing first 50 of {items.length} items. Switch to Table View for full pagination.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              No products found
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Product */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#111827', margin: 0 }}>Add New Product</h3>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: '3px 0 0' }}>Fill in the product details below</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Product Name</label>
                  <input
                    className="ci-input"
                    style={inputStyle}
                    type="text"
                    required
                    placeholder="e.g. Copper Wire 5mm"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>SKU / Code</label>
                  <input
                    className="ci-input"
                    style={inputStyle}
                    type="text"
                    required
                    placeholder="e.g. COP-005"
                    value={form.sku}
                    onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Unit (e.g. pcs, kg, m)</label>
                  <input
                    className="ci-input"
                    style={inputStyle}
                    type="text"
                    required
                    value={form.unit}
                    onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Reorder Level</label>
                  <input
                    className="ci-input"
                    style={inputStyle}
                    type="number"
                    required
                    min={0}
                    value={form.reorderLevel}
                    onChange={e => setForm(p => ({ ...p, reorderLevel: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Category</label>
                <select
                  className="ci-input"
                  style={{ ...inputStyle }}
                  required
                  value={form.categoryId}
                  onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                >
                  <option value="">Select category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ padding: '9px 18px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#6b7280' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#fff' }}
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}