'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Users, ShieldCheck, UserCheck, Trash2, Search, 
  AlertTriangle, RefreshCw, Activity, CheckCircle2 
} from 'lucide-react';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: 'MANAGER' | 'STAFF';
  createdAt: string;
  _count?: {
    receipts: number;
    deliveries: number;
    transfers: number;
    adjustments: number;
  };
}

export default function UsersPage() {
  const currentUser = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MANAGER' | 'STAFF'>('ALL');
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'MANAGER') {
      toast.error('Access restricted. Manager privileges required.');
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const confirmDelete = async () => {
    if (!deletingUser) return;
    if (currentUser?.id === deletingUser.id) {
      toast.error('You cannot delete your own manager account.');
      setDeletingUser(null);
      return;
    }

    try {
      setIsDeleting(true);
      const res = await axios.delete(`/users/${deletingUser.id}`);
      toast.success(res.data?.message || `User ${deletingUser.name} removed successfully.`);
      setDeletingUser(null);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to remove user from database.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const managerCount = users.filter((u) => u.role === 'MANAGER').length;
  const staffCount = users.filter((u) => u.role === 'STAFF').length;

  if (currentUser?.role !== 'MANAGER') return null;

  return (
    <div style={{ padding: '24px', background: '#f8f9fc', minHeight: '100%', fontFamily: 'DM Sans, sans-serif' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .user-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      `}</style>

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#eef2ff', padding: '6px', borderRadius: '8px', color: '#4f46e5' }}>
              <ShieldCheck size={20} />
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>
              User Rights & System Accounts
            </h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0 34px' }}>
            Admin controls to view user activity, manage roles, and permanently remove accounts from the system.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '8px', padding: '8px 14px',
            fontSize: '12px', color: '#374151', cursor: 'pointer',
            fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Audit Banner */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: '10px', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '20px', fontSize: '12px', color: '#1e40af'
      }}>
        <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#2563eb' }} />
        <div>
          <strong>Database Integrity Safeguard:</strong> Deleting a user permanently revokes their login, deletes their profile from PostgreSQL, and reassigns past operation logs (receipts, deliveries, transfers) to the deleting manager for audit compliance.
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Total Accounts</span>
            <Users size={16} color="#6366f1" />
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
            {totalUsers}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>System Managers</span>
            <ShieldCheck size={16} color="#4f46e5" />
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, color: '#4f46e5', marginTop: '6px' }}>
            {managerCount}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Standard Staff</span>
            <UserCheck size={16} color="#16a34a" />
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
            {staffCount}
          </div>
        </div>
      </div>

      {/* Controls & Filter */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
        padding: '14px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <div style={{
            position: 'relative', width: '100%', maxWidth: '320px'
          }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px 7px 32px',
                border: '1px solid #e5e7eb', borderRadius: '8px',
                fontSize: '12px', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {(['ALL', 'MANAGER', 'STAFF'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  background: roleFilter === r ? '#eef2ff' : '#f9fafb',
                  color: roleFilter === r ? '#4f46e5' : '#6b7280'
                }}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Role</th>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Activity Summary</th>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered On</th>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Admin Privileges</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  Loading user accounts...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, idx) => {
                const isCurrentSession = currentUser?.id === u.id;
                const activityTotal = (u._count?.receipts || 0) + (u._count?.deliveries || 0) + (u._count?.transfers || 0) + (u._count?.adjustments || 0);
                const initials = u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

                return (
                  <tr key={u.id} style={{ borderBottom: idx < filteredUsers.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    {/* User info */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: u.role === 'MANAGER' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e5e7eb',
                          color: u.role === 'MANAGER' ? '#fff' : '#4b5563',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 700, flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>
                            {u.name} {isCurrentSession && <span style={{ color: '#6366f1', fontSize: '11px', fontWeight: 600 }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        background: u.role === 'MANAGER' ? '#eef2ff' : '#f0fdf4',
                        color: u.role === 'MANAGER' ? '#4f46e5' : '#16a34a',
                        border: `1px solid ${u.role === 'MANAGER' ? '#c7d2fe' : '#bbf7d0'}`
                      }}>
                        {u.role === 'MANAGER' ? 'Manager (Admin)' : 'Staff Member'}
                      </span>
                    </td>

                    {/* Activity */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4b5563' }}>
                        <Activity size={12} color="#6366f1" />
                        <span><strong>{activityTotal}</strong> total ops ({u._count?.receipts || 0} in, {u._count?.deliveries || 0} out)</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {isCurrentSession ? (
                        <span style={{
                          fontSize: '11px', color: '#9ca3af',
                          background: '#f3f4f6', padding: '4px 10px',
                          borderRadius: '6px', fontWeight: 500
                        }}>
                          Active Manager
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeletingUser(u)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            color: '#dc2626', borderRadius: '7px', padding: '6px 12px',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = '#dc2626';
                            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2';
                            (e.currentTarget as HTMLButtonElement).style.color = '#dc2626';
                          }}
                        >
                          <Trash2 size={13} /> Remove User
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {deletingUser && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '14px',
            maxWidth: '460px', width: '100%', padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                background: '#fef2f2', color: '#dc2626',
                padding: '8px', borderRadius: '50%'
              }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>
                  Confirm Permanent Removal
                </h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
                  Admin privileges required
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, margin: '0 0 16px' }}>
              Are you sure you want to remove <strong>{deletingUser.name}</strong> (<code>{deletingUser.email}</code>) from the system and PostgreSQL database?
            </p>

            <div style={{
              background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb',
              padding: '12px', fontSize: '12px', color: '#4b5563', marginBottom: '20px'
            }}>
              <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>System Effect:</div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>User account will be deleted from the database.</li>
                <li>They will no longer be able to log in or request OTPs.</li>
                <li>Historical receipts/orders will be securely assigned to your manager audit record.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  border: '1px solid #e5e7eb', background: '#fff',
                  fontSize: '12px', fontWeight: 600, color: '#4b5563',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px',
                  border: 'none', background: '#dc2626',
                  fontSize: '12px', fontWeight: 600, color: '#fff',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting User...' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
