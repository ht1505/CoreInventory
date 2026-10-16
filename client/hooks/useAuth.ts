'use client';

import { useState, useEffect } from 'react';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'MANAGER' | 'STAFF';
}

export function useAuth(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  return user;
}

export function isManager(): boolean {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return false;
    const user = JSON.parse(stored);
    return user.role === 'MANAGER';
  } catch {
    return false;
  }
}