export const S = {
  page: { padding: '20px', overflowY: 'auto' as const, height: '100%' },
  tableWrap: { background: '#111118', border: '1px solid #1a1a2e', borderRadius: '12px', overflow: 'hidden' },
  th: { background: '#0d0d16', color: '#4b5563', fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px', padding: '10px 14px', textAlign: 'left' as const, borderBottom: '1px solid #1a1a2e', fontWeight: 500 },
  td: { padding: '10px 14px', color: '#9ca3af', fontSize: '12px', borderBottom: '1px solid #0f0f1a' },
  tdPrimary: { padding: '10px 14px', color: '#e5e7eb', fontSize: '12px', fontWeight: 500, borderBottom: '1px solid #0f0f1a' },
  input: { width: '100%', background: '#0d0d14', border: '1px solid #1f2937', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' },
  btnPrimary: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  btnSecondary: { background: 'transparent', color: '#9ca3af', border: '1px solid #1f2937', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  btnValidate: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' },
  btnGhost: { background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', borderRadius: '4px' },
  btnOutline: { background: 'transparent', border: '1px solid #1f2937', color: '#9ca3af', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  modalOverlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#111118', border: '1px solid #1f2937', borderRadius: '16px', padding: '24px', width: '560px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto' as const },
  modalTitle: { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '4px' },
  modalSub: { color: '#6b7280', fontSize: '13px', marginBottom: '20px' },
  select: { width: '100%', background: '#0d0d14', border: '1px solid #1f2937', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' },
  sectionTitle: { fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px', color: '#e5e7eb' },
  filterChip: (active: boolean) => ({ padding: '4px 12px', borderRadius: '20px', border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : '#1a1a2e'}`, background: active ? 'rgba(99,102,241,0.15)' : '#111118', color: active ? '#a5b4fc' : '#6b7280', fontSize: '11px', cursor: 'pointer' }),
};

export const statusStyle = (status: string) => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    DONE:     { bg: 'rgba(52,211,153,0.1)',  color: '#34d399', border: 'rgba(52,211,153,0.2)'  },
    READY:    { bg: 'rgba(99,102,241,0.1)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.2)'  },
    WAITING:  { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
    DRAFT:    { bg: 'rgba(107,114,128,0.1)',color: '#9ca3af', border: 'rgba(107,114,128,0.2)'},
    CANCELED: { bg: 'rgba(239,68,68,0.1)',  color: '#f87171', border: 'rgba(239,68,68,0.2)'  },
  };
  const s = map[status] || map.DRAFT;
  return { display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 500, background: s.bg, color: s.color, border: `1px solid ${s.border}` };
};

export const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <div style={{ width: '28px', height: '28px', border: '2px solid #1f2937', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);