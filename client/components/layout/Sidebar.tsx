"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Package, ClipboardList, Truck,
  ArrowLeftRight, SlidersHorizontal, LogOut,
  BookOpen, Warehouse, Users,
  Database,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard,   section: 'main' },
  { href: '/dashboard/products',     label: 'Products',     icon: Package,           section: 'main' },
  { href: '/dashboard/receipts',     label: 'Receipts',     icon: ClipboardList,     section: 'ops' },
  { href: '/dashboard/deliveries',   label: 'Deliveries',   icon: Truck,             section: 'ops' },
  { href: '/dashboard/transfers',    label: 'Transfers',    icon: ArrowLeftRight,    section: 'ops' },
  { href: '/dashboard/adjustments',  label: 'Adjustments',  icon: SlidersHorizontal, section: 'ops' },
  { href: '/dashboard/ledger',       label: 'Move History', icon: BookOpen,          section: 'ops' },
  { href: '/dashboard/warehouses',   label: 'Warehouses',   icon: Warehouse,         section: 'settings' },
  { href: '/dashboard/suppliers',    label: 'Suppliers',    icon: Users,             section: 'settings' },
  { href: '/dashboard/database', label: 'Database', icon: Database, section: 'settings' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  const renderSection = (label: string, section: string) => {
    const links = navLinks.filter(l => l.section === section);
    return (
      <>
        <p style={{
          padding: '12px 12px 4px', fontSize: '10px',
          color: '#9ca3af', textTransform: 'uppercase',
          letterSpacing: '0.5px', fontWeight: 600, margin: 0,
        }}>{label}</p>
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px', margin: '1px 8px',
              fontSize: '13px', textDecoration: 'none', transition: 'all 0.15s',
              background: isActive ? '#eef2ff' : 'transparent',
              color: isActive ? '#4f46e5' : '#6b7280',
              fontWeight: isActive ? 600 : 400,
            }}>
              <Icon size={14} style={{ flexShrink: 0 }} />
              {link.label}
            </Link>
          );
        })}
      </>
    );
  };

  return (
    <aside style={{
      width: '210px', height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      boxShadow: '1px 0 0 #f3f4f6',
    }}>
      {/* Logo — clicking takes back to dashboard */}
      <Link href="/dashboard" style={{ textDecoration: 'none' }}>
        <div style={{
          padding: '18px 16px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', gap: '9px',
          transition: 'background 0.15s', cursor: 'pointer',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
        >
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9"/>
              <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
              <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
              <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity="0.3"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: '#111827' }}>CoreInventory</div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>Inventory Management</div>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: '8px', overflowY: 'auto' }}>
        {renderSection('Main', 'main')}
        {renderSection('Operations', 'ops')}
        {renderSection('Settings', 'settings')}
      </nav>

      {/* User pill */}
      <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 10px', borderRadius: '8px', background: '#f9fafb',
          marginBottom: '4px',
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#111827', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Loading...'}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '10px' }}>
              {user?.role === 'MANAGER' ? 'Manager' : 'Staff'}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: '100%', padding: '7px 12px', borderRadius: '8px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#9ca3af', fontSize: '12px', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'; }}
        >
          <LogOut size={13} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;